import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
import { collectionToken, redisClient } from '../config.js'; // Access token collection

import { 
    sendUnauthorizedError,
    sendInternalServerError,
    logoutSuccess
} from '../helper_functions/helpers.js'; // Import helper functions

const logoutRouter = express.Router();

// Middleware to parse JSON and URL-encoded form data
logoutRouter.use(express.json());
logoutRouter.use(express.urlencoded({ extended: true }));

// Logout route
logoutRouter.post('/logout', async (req, res) => {
    const refreshToken = req.body.token; 
    
    // Check if the refresh token is provided
    if (!refreshToken) return sendUnauthorizedError(res);

    try {
        const userKeys = await redisClient.keys('user:*');
        let redisUserId;
        let redisKeyToDelete = null; 
        for(const key of userKeys){
            const storedRefreshToken = await redisClient.hGet(key, 'refreshTOken');
            if(storedRefreshToken === refreshToken){
                redisUserId = await redisClient.hGet(key, 'userId');
                redisKeyToDelete = key;
                break;  
            }
        }
         // Delete the Redis key if found
         if (redisKeyToDelete) {
            const delResult = await redisClient.del(redisKeyToDelete);
            if (delResult) {
                console.log(`Redis data for user ${redisUserId} removed successfully`);
            } else {
                console.log(`Failed to delete Redis data for user ${redisUserId}`);
            }
        } else {
            console.log("No matching Redis key found for the provided token");
        }

        // Check if the refresh token exists in the database
        const userTokenData = await collectionToken.findOne({ refreshToken });
        
        if (!userTokenData) {
            return sendUnauthorizedError(res); // Token not found, return unauthorized
        }

        const userId = userTokenData.userId;

        // Remove token data from the token collection
        await collectionToken.deleteOne({ userId });

        //session destroy
        req.session.destroy((err)=>{
            if(err){
                return sendInternalServerError(res, "errror duirng session destruction");
            }
            res.clearCookie('connect.sid');
            console.log(`sessioon  data removed successfully`);
            return logoutSuccess(res, "Successfully logged out");
            
        });
    } catch (error) {
        console.error('Error during logout:', error);
        return sendInternalServerError(res); // Handle server errors
    }
});

export default logoutRouter;
