import logger from "../../common/utils/logger";
import { isRegisterAndLogin } from "../../common/utils/ckeck_register_login";
import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { dbDetails } from "../../common/db/DB_details";
import { userBlogs } from "../db/blogTable";
import { User } from "../../users/db/userTable";

const updateBlog: Router = express.Router();

updateBlog.put("/update-blog", async (req: Request, res: Response): Promise<void> => {
    const { username, title, description } = req.body;

    // Check if all necessary fields are provided
    if (!username || !title || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
        return;
    }

    try {
        // Ensure the user is registered and logged in
        const isRegisterLogin = await isRegisterAndLogin(username);
        if (!isRegisterLogin) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "You are not logged in or registered" });
            return;
        }

        // Retrieve the user from the User table
        const userRepo = dbDetails.getRepository(User);
        const user = await userRepo.findOne({ where: { username } });
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            return;
        }

        // Access the user's email and userId
        const userEmail = user.email;
        const userId = user.userId;

        // Retrieve the blog to update from the userBlogs table
        const blogRepo = dbDetails.getRepository(userBlogs);
        const existingBlog = await blogRepo.findOne({ where: { username, blogTitle: title } });
        
        if (!existingBlog) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Blog does not exist with this username and title" });
            return;
        }

        // Update the blog fields
        existingBlog.username = username;
        existingBlog.blogTitle = title;
        existingBlog.blogDescription = description;
        existingBlog.userEmail = userEmail;
        existingBlog.userId = userId; 

        // Save the updated blog
        await blogRepo.save(existingBlog);

        res.status(StatusCodes.OK).json({ message: "Blog updated successfully" });
    } catch (error) {
        logger.error("Update blog error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the blog." });
    }
});

export default updateBlog;
