import { dbDetails } from "../../common/db/DB_details";
import redisClient from "../../common/utils/redisClient";
import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../../users/db/userTable";
import { userBlogs } from "../../blogs/db/blogTable";
import logger from "../../common/utils/logger";

const viewBlog:Router = express.Router();

viewBlog.get("/view-blog", async(req:Request, res:Response):Promise<void>=>{
    const {username} = req.body;
    if(!username){
        res.status(StatusCodes.BAD_REQUEST).json({message : "username is require"});
        return
    }

   try {
    
    const getTokenTable = dbDetails.getRepository(userBlogs);
    const isAddedBlogs =await  getTokenTable.find({where: {username},});
    if(isAddedBlogs.length === 0){
        res.status(StatusCodes.BAD_REQUEST).json({message: "you don't add any blogs"});
        return;
    }
    
    // Map all blog titles and descriptions
    const blogs = isAddedBlogs.map((blog) => ({
        title: blog.blogTitle,
        description: blog.blogDescription,
      }));
  
      res.status(StatusCodes.OK).json({
        message: "Your blogs",
        blogs, 
      });
   } catch (error) {
    logger.error("view blog error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during view blog." });
   }
})

export default viewBlog;