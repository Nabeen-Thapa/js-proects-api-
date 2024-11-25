import { dbDetails } from "../../common/db/DB_details";
import redisClient from "./redisClient";
import { User } from "../../users/db/userTable";
import logger from "./logger";

export const isRegisterAndLogin = async (username: string): Promise<boolean> => {
    try {
        // Check if the user is logged in by searching Redis for their session
        const isExistInRedis = await redisClient.keys(`username:${username}`);
        
        if (isExistInRedis.length === 0) {
            // User is not logged in, check if they are registered
            const getUserTable = dbDetails.getRepository(User);
            const isExistUsername = await getUserTable.findOne({ where: { username } });
            
            if (!isExistUsername) {
                throw new Error("User is not registered. Please register first.");
            }

            throw new Error("User is not logged in. Please log in first.");
        }

        return true; // User is logged in

    } catch (error) {
        if (error instanceof Error) {
            logger.error("Check register and login error:", error.message);
            // Return a boolean or handle the error gracefully
            return false;
        } else {
            logger.error("Unexpected error type:", error);
            return false; // Indicating failure without crashing the app
        }
    }
};
