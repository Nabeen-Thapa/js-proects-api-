import { dbDetails } from "../../common/db/DB_details";
import { isRegisterAndLogin } from "../../common/utils/ckeck_register_login";
import logger from "../../common/utils/logger";
import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { userBlogs } from "../db/blogTable";

const deleteBLog:Router = express.Router();

deleteBLog.delete("/delete-blog" , async (req:Request, res:Response):Promise<void> =>{
    const {username, blogTitle} = req.body;

    if(!username || !blogTitle){
        res.status(StatusCodes.BAD_REQUEST).json({message : "username and blog title requuired"});
        return;
    }
    try {
    const isRegisterLogin = isRegisterAndLogin(username);
     if (!isRegisterLogin) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "you are not login and register"});
        return;
    }
    const getBolgsForDelete = dbDetails.getRepository(userBlogs);
    const isExistUsersBlog = await getBolgsForDelete.findOne({where: {username:username,blogTitle:blogTitle },});
    if(!isExistUsersBlog){
        res.status(StatusCodes.BAD_REQUEST).json({ message: "blog is not exist with this username and title"});
        return;
    }
    const blogId = isExistUsersBlog?.blogId;
    await getBolgsForDelete.delete({ blogId: blogId });
    res.status(StatusCodes.OK).json({ message: "blog is deleted successfully"});

    } catch (error) {
        logger.error("view blog error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during view blog." });
    }
});

export default deleteBLog;