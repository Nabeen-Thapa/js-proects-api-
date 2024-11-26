import { StatusCodes } from "http-status-codes";
import { Tokens } from "../../users/db/tokenTable";
import { dbDetails } from "../db/DB_details";
import redisClient from "./redisClient"
import logger from "./logger";



export const uploadLoggedInDataInRedis = async (username: string): Promise<boolean> => {

    try {
        const isExistUserInRedis = await redisClient.EXISTS(`username:${username}`);        
        if (!isExistUserInRedis) {
            const getTokenRepo = dbDetails.getRepository(Tokens);
            const isUserLoggedIn = await getTokenRepo.findOne({ where: { username }});
            if (!isUserLoggedIn) {
               return false;
            }
            await redisClient.set(`username:${username}`, JSON.stringify({
                userId: isUserLoggedIn?.userId,
                    userEmail: isUserLoggedIn.userEmail,
                    userName: isUserLoggedIn.username,
                    accessToken: isUserLoggedIn.accessToken,
                    refreshToken: isUserLoggedIn.refreshToken,
            }), { EX: 60 * 60 * 24 * 10 });
            return true  
        }
        return true;
    } catch (error) {
        if (error instanceof Error) {
            logger.error("user update error:", error.message);
            // Return a boolean or handle the error gracefully
            return false;
        } else {
            logger.error("Unexpected error type while updating user:", error);
            return false; 
        }
    }

}
