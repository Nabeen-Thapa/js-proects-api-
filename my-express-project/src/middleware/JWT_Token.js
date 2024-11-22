const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
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
const jwt_secret = process.env.jwt_secret;


//middleware for protection
export const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //split authHeader where request token is stored in the  "authorization: Bearer <token>" formlat it split this format and access token that is in 1 index of array 
    if (token == null) return sendForbiddenError(res);
    jwt.verify(token, jwt_secret, (err, user) => {
        if (err) return sendForbiddenError(res);
        req.user = user;
        next();
    })
};