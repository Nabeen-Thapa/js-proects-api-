
import jwt from 'jsonwebtoken';
import {sendUnauthorizedError, sendForbiddenError } from '../helper_functions/helpers.js';

// Middleware to authenticate token
export const  authenticateToken =(req, res, next)=> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return sendUnauthorizedError(res); // If token is missing
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return sendForbiddenError(res); // If token is invalid
        req.user = user; // Store user info from token
        next(); // Continue to the next middleware or route handler
    });
    
};