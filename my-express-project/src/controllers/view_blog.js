import express from "express";
import { collectionPost, collection, collectionToken } from "../config.js";
import { sendBadRequestError, sendNotFoundError, sendInternalServerError } from "../helper_functions/helpers.js";

const viewBlog = express.Router();

viewBlog.get('/view-blog', async (req, res) => {
    const { userEmail } = req.body;
    if (!userEmail) {
        return sendBadRequestError(res, "userEmail field is required");
    }
    try {
        //check registered or not on user_details collection
        const userdata = await collection.find({ email: userEmail });
        if (userdata.length === 0) {
            return sendInvalidRequestError(res, "User not registered yet. Please register first.");
        }
        //ckeck with user_TOken collction
        const userTokenData = await collectionToken.find({ userEmail });
        if (userTokenData.length === 0) {
            return sendInvalidRequestError(res, "User not logged in. Please log in first.");
        }
        // Find posts based on userEmail
        const userPosts = await collectionPost.find({ userEmail });

        // Check if posts are found
        if (userPosts.length === 0) {
            return sendNotFoundError(res, "No posts found for this user.");
        }

        // Return the posts in JSON format
        return res.json({ posts: userPosts });
    } catch (error) {
        console.error("Error in view-blog route:", error);
        return sendInternalServerError(res, "Server error");
    }
});

export default viewBlog;
