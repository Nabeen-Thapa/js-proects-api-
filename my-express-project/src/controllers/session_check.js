import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import session from 'express-session';
const app = express();
const sessionCheckRouter = express.Router();
import { 
    sendUserExistsError, 
    sendInvalidRequestError, 
    sendInternalServerError, 
    sendRegistrationSuccess, 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess
} from '../helper_functions/helpers.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to check session
sessionCheckRouter.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({
            message: "Session is active",
            userId: req.session.userId,
            username: req.session.username,
            userEmail : req.session.userEmail
        });
    } else {
       return sendUnauthorizedError(res, "No active session found");
    }
});

export default sessionCheckRouter;
