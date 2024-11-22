import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { collection,  collectionToken, redisClient} from '../config.js';
const app = express();
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
const loginRouter = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }); // Use expiresIn
}

//for the login
loginRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await collection.findOne({ username});
        if (!user) {
           return res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: ReasonPhrases.UNAUTHORIZED });
        }
       const userId = user.userId;
       const userEmail = user.email;
       
        //for jwt token
        const userLogin = {username: username , password : password};
        const accessToken = generateAccessToken(userLogin);
        const refreshToken = jwt.sign(userLogin, process.env.REFRESH_TOKEN_SECRET);

       
        if (!req.session) {
            // Handle session issues gracefully
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Session is unavailable" });
        }
        //store data in session
        req.session.userId = userId;
        req.session.username = username;
        req.session.userEmail = userEmail;

        const redisKey = `user:${userId}`;
        await redisClient.hSet(redisKey,{
            userId: userId,
            userEmail: userEmail,
            username : `${user.username}`,
             accessToken :accessToken,
              refreshToken: refreshToken,
        });
        await redisClient.expire(redisKey, 60*60);//expire on 30 days


        const userTokens = {
            accessToken:accessToken,
            refreshToken : refreshToken, 
            userEmail :userEmail,
            userId :userId
        }
         const existUserId = await collectionToken.findOne({userId : userId});
        if(existUserId){
            return res.status(StatusCodes.OK).json({ message: "already logged in" });
        }else {
            await collectionToken.create(userTokens);
        }
        res.json({
            message: "login successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            redirectUrl: '/api/home'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
});

export default loginRouter;