import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import redisClient from "../../common/utils/redisClient";
import { dbDetails } from "../../common/db/DB_details";
import { userBlogs } from "../db/blogTable";
import { User } from "../../users/db/userTable";
import logger from "../../common/utils/logger";
import { Tokens } from "../../users/db/tokenTable";
import { uploadLoggedInDataInRedis } from "../../common/utils/redis_data_upload";


const addBlog: Router = express.Router();

addBlog.post("/add-blog", async (req: Request, res: Response): Promise<void> => {
    const { username, title, description } = req.body;

    if (!username || !title || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "all fileds are required" });
    }
    try {
        //check iser is registerd or not
        const accessUserTable = dbDetails.getRepository(User);
        const isUserRegistered = await accessUserTable.findOne({where : {username},});
        if(!isUserRegistered){
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "you are not register, register first" });
        }
        //get userdata
        const userId = isUserRegistered?.userId;
        const userEmail = isUserRegistered?.email;
        //check in redis
        // const CheckUserInRedis = await redisClient.keys("username: *");
        // if (CheckUserInRedis.length === 0) {
        //     res.status(StatusCodes.UNAUTHORIZED).json({ message: "you are not athorized ,login first" });
        //     return;
        // }

        const isUserLoggedIn = await uploadLoggedInDataInRedis(username);
        if (!isUserLoggedIn) {
          res.status(StatusCodes.BAD_REQUEST).json({ message: "This user is not logged in." });
          return;
        }
        // const getTokenTable = await dbDetails.getRepository(Tokens);
        // const isLoggedIn = await getTokenTable.findOne({ where: { username } });
        // if (!isLoggedIn) {
        //     res.status(StatusCodes.UNAUTHORIZED).json({ message: "you are not logged in" });
        //     return;
        // }
        const accessBlogTable = dbDetails.getRepository(userBlogs);
        const isBlogSameUsername = await accessBlogTable.findOne({ where: { username, blogTitle: title } });
        const BlogUsername = isBlogSameUsername?.username;
        const blogTitle = isBlogSameUsername?.blogTitle;
        if (isBlogSameUsername) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "blog title of provied user is already exist"});
        }else{
            const newBlog = accessBlogTable.create({
                userId :userId,
                userEmail :userEmail,
                username : username,
                blogTitle:title,
                blogDescription:description,
            });
            await accessBlogTable.save(newBlog);
        }
        res.status(StatusCodes.OK).json({message : "blog is add successfully"});
    } catch (error) {
        logger.error("add blog error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during add blog." });
    }
});

export default addBlog;

