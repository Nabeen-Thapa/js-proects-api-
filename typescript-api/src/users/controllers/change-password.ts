import { dbDetails } from '../../common/db/DB_details';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../users/db/userTable';
import bcrypt from 'bcrypt';
import { Tokens } from '../../users/db/tokenTable';
import logger from '../../common/utils/logger';
import redisClient from '../../users/utils/redisClient';
import { uploadLoggedInDataInRedis } from '../../common/utils/redis_data_upload';

const changeUserPassowrd: Router = express.Router();

changeUserPassowrd.post('/change-password', async (req: Request, res: Response): Promise<void> => {
    const { username, oldPassword, newPassword, confirmPassword } = req.body;

    if (!username || !oldPassword || !newPassword || !confirmPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "all fields are required" });
        return;
    }
    if (newPassword !== confirmPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "confirm password should match with new password" });
        return;
    }
    try {
        //check user logfed in or not
         const getTokenTable = dbDetails.getRepository(Tokens);
         const isLoggedIn = await getTokenTable.findOne({ where: { username } });
        if (!isLoggedIn) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "you are not logged in" });
            return;
        }
        // const isUserLoggedIn = await uploadLoggedInDataInRedis(username);
        // if (!isUserLoggedIn) {
        //   res.status(StatusCodes.BAD_REQUEST).json({ message: "This user is not logged in." });
        //   return;
        // }

        //check user is registered or not
        const getUserDB = dbDetails.getRepository(User);
        const isValidUsername = await getUserDB.findOne({ where: { username } });
        if (!isValidUsername) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "this username is not exixst" });
            return;
        }
        const oldPasswordMatch = await bcrypt.compare(oldPassword, isValidUsername.password)
        if (!oldPasswordMatch) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "old password not match " });
            return;
        }
        const hashNewPassword = await bcrypt.hash(newPassword, 10)
        isValidUsername.password = hashNewPassword;
        await getUserDB.save(isValidUsername);
        // Respond with success
        const checkInRedis = await redisClient.keys('username:*');
        let redisData;
        let deleteFromRedis = null;

        for (const key of checkInRedis) {
            // Retrieve data from Redis and parse it
            const storedData = await redisClient.get(key);
            const parsedData = storedData ? JSON.parse(storedData) : null;
            //JSON.parse(storedData) to properly parse the stringified JSON when retrieving the data from Redis. because in redis data are stored using (JSON.stringify({...}))
            if (parsedData?.username === username) {
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
        const userId = isLoggedIn.userId;
        await getTokenTable.delete({ userId });
        res.status(StatusCodes.OK).json({ message: "Password changed successfully, login again to continue" });
    } catch (error) {
        logger.error("change password error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during change passowrd." });
    }

});

export default changeUserPassowrd;

