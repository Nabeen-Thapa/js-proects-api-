import { dbDetails } from "../../common/db/DB_details";
import express, { Request, Response, Router } from "express";
import { Tokens } from "../db/tokenTable";
import { StatusCodes } from "http-status-codes";
import redisClient from "../../users/utils/redisClient";
import logger from "../../common/utils/logger";

const userLogout: Router = express.Router();

userLogout.post("/logout", async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;//get refresh token
    try {

        //check in redis
        const checkInRedis = await redisClient.keys('username:*');
        let redisData;
        let deleteFromRedis = null;

        for (const key of checkInRedis) {
            // Retrieve data from Redis and parse it
            const storedData = await redisClient.get(key); 
            const parsedData = storedData ? JSON.parse(storedData) : null;
            //JSON.parse(storedData) to properly parse the stringified JSON when retrieving the data from Redis. because in redis data are stored using (JSON.stringify({...}))
            if (parsedData?.refreshToken === token) {
                redisData = key;
                deleteFromRedis = key;
                break; // Exit loop once token match is found
            }
        }
        //delete form redis if exist
        if (deleteFromRedis) {
            const delResult = await redisClient.del(deleteFromRedis);
            if (delResult) {
                logger.info(`Redis data for user removed successfully`);
            } else {
                logger.info(`Failed to delete Redis data for user `);
            }
        } else {
            logger.info("No matching Redis key found for the provided token");
        }
        //check in database token table
        const getTokenTable = dbDetails.getRepository(Tokens);
        const isExistToken = await getTokenTable.findOne({ where: { refreshToken: token } });
        if (!isExistToken) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "you are not logged in" });
            return;
        }
        const userId = isExistToken.userId;
        await getTokenTable.delete({userId});
        res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
    } catch (error) {
        logger.error("logout error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during logout." });
    }

})

export default userLogout;

