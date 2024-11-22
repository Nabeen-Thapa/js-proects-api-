import { dbDetails } from "../../common/db/DB_details";
import express,{Request, Response, Router} from "express";
import { StatusCodes } from "http-status-codes";
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { User } from "../../users/db/userTable";
import bcrypt from 'bcrypt';
import logger from "../../common/utils/logger";
import { Tokens } from "../../users/db/tokenTable";
import redisClient from "../../users/utils/redisClient";
const userLogin:Router = express.Router();

interface userLoginRequest{
    username:string;
    password:string;
}
//generate accress token
function generateAccessToken(user:userLoginRequest):string{
    const secretAccessToken = process.env.ACCESS_TOKEN_SECRET;
    if (!secretAccessToken) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    }
    return jwt.sign(user, secretAccessToken, { expiresIn: '60m' });
}

userLogin.post('/login',async (req:Request, res:Response):Promise<void>=>{
    const {username, password}:userLoginRequest =  req.body;
    if(!username || !password){
        res.status(StatusCodes.BAD_REQUEST).json({message :"username and password both require"});
    }
    try {
        //check data in redis 
        const isUserExistInRedis = await  redisClient.get(`username:${username}`);
        if(isUserExistInRedis){
            res.status(StatusCodes.OK).json({ message: "already logged in ckecked from redis" });
            return; 
        }else{
        const getDatabase = dbDetails.getRepository(User);
        const isRegistered = await getDatabase.findOne({ where: { username }, });
                if(!isRegistered){
            res.status(StatusCodes.BAD_REQUEST).json({message :"you are not registered, register first" });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, isRegistered.password);

        if(!passwordMatch){
            res.status(StatusCodes.UNAUTHORIZED).json({message :"invalid password or username"});
            return;
        }

        const userId = isRegistered.userId;
        const userEmail = isRegistered.email;
        //for jwt
        const jwtData = {username: username, userId :userId, password:password}
        const accessToken = generateAccessToken(jwtData);
        const envRefreshTOken:any = process.env.REFRESH_TOKEN_SECRET;
        const refreshToken = jwt.sign(jwtData,envRefreshTOken );
        const userTokens = {
            accessToken:accessToken,
            refreshToken : refreshToken, 
            userEmail :userEmail,
            userId :userId
        }
        //store data in redis
         //const redisKey = `username:${username}`;
        // await redisClient.hSet(redisKey,{
        //     userId: userId,
        //     userEmail: userEmail,
        //     username : username,
        //      accessToken :accessToken,
        //       refreshToken: refreshToken,
        // });
        // await redisClient.expire(redisKey, 60*60*60*10);//expire on 10 days

            await redisClient.set(`username:${username}`, JSON.stringify({
                userId: userId,
                userEmail: userEmail,
                username : username,
                 accessToken :accessToken,
                  refreshToken: refreshToken,
            }), { EX: 60 * 60 * 24 * 10 });

        const getTOkens = dbDetails.getRepository(Tokens);
        const isExistUserId = await getTOkens.findOne({ where: { userId }, });
        if(isExistUserId){
             res.status(StatusCodes.OK).json({ message: "already logged in" });
             return; 
        }else {
            await getTOkens.create(userTokens);
        }


        res.json({
            message: "login successfully",
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
        
    } catch (error) {
     logger.error("Login error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during login." });
    }
});
export default userLogin;