//middleware to check redis data time out , if time out or missing data restore again
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { redisClient } from "../config.js";

export const checkRedisData= async(req,res, next)=>{
    try{
        //check session
        if(!req.session || !req.session.userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({message: ReasonPhrases.UNAUTHORIZED});
        }

        const userId =req.session.userId;
        const redisKey = `user:${userId}`;
        // Check if Redis data exists
        const redisData = await redisClient.hGetAll(redisKey);

        if(Object.keys(redisData).length === 0){
           //if missing restore redis data
           const userToken = await collectionToken.findOne({ userId });
           if (!userToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Session expired. Please log in again." });
        }
         // Restore Redis data
         await redisClient.hSet(redisKey, {
            userId: userToken.userId,
            userEmail: userToken.userEmail,
            username: req.session.username, // Use session username
            accessToken: userToken.accessToken,
            refreshToken: userToken.refreshToken,
        });
          // Reset Redis expiration
          await redisClient.expire(redisKey, 60 * 60 * 24 *30); // 30 day
          console.log('Redis data restored for user:', userId);
        }
        next();
    } catch (error) {
        console.error('Error restoring Redis data:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}