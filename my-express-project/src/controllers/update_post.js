import express from 'express';
import { collection, collectionPost, collectionToken } from '../config.js';
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

const updatePost = express.Router();

updatePost.put('/update-post', async (req,res)=>{
    const { userEmail, postTitle, postDescription } = req.body;

    if (!userEmail) {
        return sendBadRequestError(res, "userEmail is required");
    }
    
    if (!postTitle || !postDescription) {
        return sendBadRequestError(res, "postTitle and postDescription are required");
    }
    try {
        const userregister = await collection.findOne({email: userEmail})
        if(!userregister){
            return res.json({message: "not register, register first"});
        }
        const userLoggedIn = await collectionToken.findOne({userEmail})
        if(!userLoggedIn){
            return res.json({message: "not logged in, login first"});
        }
        const userdata = await collectionPost.findOne({userEmail, postTitle });
       
        if (!userdata) {
            return sendNotFoundError(res, "user not found, check the email");
        }

        const postData = {
            userEmail: userEmail,
            postTitle: postTitle,
            postDescription: postDescription
        }
        await collectionPost.updateOne({userEmail}, {$set : postData});
        res.json({
            message: "post update successfully"
        });

    } catch (error) {
        console.error("Error in update post route:", error);
        return sendInternalServerError(res);
    }
})

export default updatePost;