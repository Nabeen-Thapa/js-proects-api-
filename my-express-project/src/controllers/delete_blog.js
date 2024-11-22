import express from "express";
const deleteBLog = express.Router();
import { collection, collectionPost, collectionToken } from "../config.js";
import {
    sendUserExistsError,
    sendInvalidRequestError,
    sendInternalServerError,
    sendRegistrationSuccess,
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js';


deleteBLog.delete('/delete-blog', async (req, res) => {
    const { userEmail, postTitle } = req.body;
    if (!userEmail || !postTitle) {
        return sendBadRequestError(res, "userEmail and postTitle fields are rquired");
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

        const deletedata = await collectionPost.find({ userEmail, postTitle })
        if (deletedata.length === 0) {
            return sendNotFoundError(res, "email not found");
        }
        await collectionPost.deleteOne({ userEmail, postTitle });
        return res.json({message :"post deleted successfully"});
    } catch (error) {
        console.error("Error in delete-blog route:", error);
        return sendInternalServerError(res, "Server error");
    }
})

export default deleteBLog;