import express from "express";
import { collection, collectionPost, collectionToken } from "../config.js";
import {
    sendUserExistsError,
    sendInvalidRequestError,
    sendInternalServerError,
    sendBadRequestError,
    sendRegistrationSuccess,
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js'; // Import helper functions

const addBlog = express.Router();

addBlog.post('/add-blog', async (req, res) => {
    const { userEmail, postTitle, postDescription } = req.body;

    if (!userEmail) {
        return  sendBadRequestError(res, "userEmail is required");
    }
    if (!postTitle || !postDescription) {
        return sendBadRequestError(res, "postTitle and postDescription are required");
    }
    //check with user_detail collection
    try {
        const userdata = await collection.find({ email: userEmail });
        if (userdata.length === 0) {
            return sendInvalidRequestError(res, "User not registered yet. Please register first.");
        }
        
        //ckeck with user_TOken collction
        const userTokenData = await collectionToken.find({ userEmail });
        if (userTokenData.length === 0) {
            return sendInvalidRequestError(res, "User not logged in. Please log in first.");
        }

        const postData = {
            userEmail: userEmail,
            postTitle: postTitle,
            postDescription: postDescription
        }
        await collectionPost.create(postData);
        res.json({
            message: "post creaed successfully"
        });

    } catch (error) {
        console.error("Error in add-blog route:", error);
        return sendInternalServerError(res);
    }
});

export default addBlog;