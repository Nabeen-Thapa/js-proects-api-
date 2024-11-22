import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import util from 'util';
import { collectionToken } from '../config.js'; // Access connection to the token collection
import { authenticateToken } from '../middleware/authenticate_token.js';
const getNewAccessToken = express.Router();

import { 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendInternalServerError
} from '../helper_functions/helpers.js'; // Import helper functions

// Middleware to parse JSON and URL-encoded form data
getNewAccessToken.use(express.json());
getNewAccessToken.use(express.urlencoded({ extended: true }));

// Function to generate access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' }); // Expiration can be adjusted
}

// Get new access token through refresh token
getNewAccessToken.post('/token', async (req, res) => {
    const refreshToken = req.body.token; // Expect the refresh token in the body

    // If no token is provided, send unauthorized response
    if (!refreshToken) return sendUnauthorizedError(res);

    try {
        // Find the refresh token in the database
        const findToken = await collectionToken.findOne({ refreshToken: refreshToken });
        if (!findToken) return sendForbiddenError(res); // If refresh token is not found, forbid access

        // Verify the refresh token
        const verifyToken = util.promisify(jwt.verify);
        const user = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Generate a new access token
        const accessToken = generateAccessToken({ username: user.username });

        // Update the database with the new access token
        findToken.accessToken = accessToken;
        await findToken.save();

        // Return the new access token
        res.json({ accessToken: accessToken });
    } catch (error) {
        console.error('Error:', error);

        // Handle token verification errors
        if (error.name === 'JsonWebTokenError') {
            return sendForbiddenError(res);
        }

        // Send internal server error for other issues
        return sendInternalServerError(res);
    }
});

export default getNewAccessToken;
