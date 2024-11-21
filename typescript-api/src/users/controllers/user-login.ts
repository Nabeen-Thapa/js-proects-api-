import { dbDetails } from "common/db/DB_details";
import express,{Request, Response, Router} from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "users/db/userTable";
const userLogin:Router = express.Router();


interface userLoginRequest{
    username:string;
    password:string;
}


userLogin.post('/login',async (req:Request, res:Response):Promise<void>=>{
    const {username, password}:userLoginRequest =  req.body;
    if(!username || !password){
        res.status(StatusCodes.BAD_REQUEST).json({message :"username and password both require"});
    }
    try {
        const isRegistered = dbDetails.getRepository(User);
        
    } catch (error) {
        
    }
});

export default userLogin;