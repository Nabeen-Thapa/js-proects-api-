import { dbDetails } from "../../common/db/DB_details";
import redisClient from "../../common/utils/redisClient";
import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../../users/db/userTable";
import { userBlogs } from "../../blogs/db/blogTable";
import logger from "../../common/utils/logger";

const viewBlog:Router = express.Router();

viewBlog.post("/view-blog", async(req:Request, res:Response):Promise<void>=>{
    const {username} = req.body;
    if(!username){
        res.status(StatusCodes.BAD_REQUEST).json({message : "username is require"});
        return
    }

   try {
    const isExistInRedis = await redisClient.keys(`username:${username}`);
    if(isExistInRedis.length ===0){
        const getUserTable = dbDetails.getRepository(User);
        const isExistUsername = await getUserTable.findOne({where: {username}});
        if(!isExistUsername){
            res.status(StatusCodes.UNAUTHORIZED).json({message: "you are not registered in, register first"});
            return;
        }
        res.status(StatusCodes.UNAUTHORIZED).json({message: "you are not logged in, login first"});
        return;
    }
    const getTokenTable = dbDetails.getRepository(userBlogs);
    const isAddedBlogs =await  getTokenTable.findOne({where: {username},});
    if(!isAddedBlogs){
        res.status(StatusCodes.BAD_REQUEST).json({message: "you don't add any blogs"});
        return;
    }
    const blogTitle =  await isAddedBlogs?.blogTitle;
    const  blogDescription = await isAddedBlogs?.blogDescription;
    res.json({
        message: "your blogs",
       title : blogTitle,
       description:blogDescription
    });
   } catch (error) {
    logger.error("view blog error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during view blog." });
   }
})

export default viewBlog;