import express from "express";
const changePassword = express.Router();
import bcrypt from 'bcrypt';
import { collection } from '../config.js'; // Access the user collection from your config
import { 
    sendUnauthorizedError, 
    sendInternalServerError, 
    sendSuccess,
    sendBadRequestError
} from '../helper_functions/helpers.js';


changePassword.post('/change-password', async(req,res)=>{
        const {email, oldPassword, newPassword, confirmPassword} = req.body;

        if(!email || !oldPassword || !newPassword || !confirmPassword){
            return sendBadRequestError(res);
        }

        if(newPassword !== confirmPassword){
            return sendBadRequestError(res, 'New password and confirm password do not match');
        }
        try {
            const userEmail = await collection.findOne({email});
            if(!userEmail){
                return sendUnauthorizedError(res, 'email not found');
            }
            const passwordMatch  = await bcrypt.compare(oldPassword, userEmail.password);
            if(!passwordMatch){
                return sendUnauthorizedError(res, 'Old password is incorrect');
            }

            const hashNewPassword = await bcrypt.hash(newPassword, 10)
            userEmail.password= hashNewPassword;
            await userEmail.save();
            return sendSuccess(res);
        } catch (error) {
            console.error('Error changing password:', error);
            return sendInternalServerError(res);
        }
});

export default changePassword;