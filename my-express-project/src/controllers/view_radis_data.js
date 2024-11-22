import express from 'express';
import { redisClient } from '../config.js'; // Adjust the path as necessary
import { 
    sendUserExistsError, 
    sendInvalidRequestError, 
    sendInternalServerError, 
    sendRegistrationSuccess, 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js'; // Import helper functions


const viewRadisData = express.Router();
viewRadisData.get('/view/:userId', async (req, res) => {
    const userId = req.params.userId;
    const redisKey = `user:${userId}`;
    try {
        const userData = await redisClient.hGetAll(redisKey);
        if (Object.keys(userData).length === 0) {
            return sendNotFoundError(res);
        }
        res.json(userData);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: "Internal server error." });
    }
});

export default viewRadisData;