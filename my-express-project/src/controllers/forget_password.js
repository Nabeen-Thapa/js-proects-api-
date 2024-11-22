import express from 'express';
const forgetPassword = express.Router();
import nodeMailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt'; 
import { authenticator } from 'otplib';
import { collection,  collectionToken} from '../config.js'; // to accress connection
import { 
    sendUserExistsError, 
    sendInvalidRequestError, 
    sendInternalServerError, 
    sendRegistrationSuccess, 
    sendUnauthorizedError,
    sendForbiddenError,
    sendNotFoundError,
    sendLogoutSuccess,
    emailSuccess
} from '../helper_functions/helpers.js';

async function generateUniqueOtp() {
    let otp;
    let userWithSameOtp;

    do {
        otp = authenticator.generateSecret().slice(0, 4); // Generate 4-digit number
        userWithSameOtp = await collection.findOne({ password: otp });
    } while (userWithSameOtp);
    return otp;
}

forgetPassword.post('/forget-password', async(req, res)=>{
    const {email} =req.body;
    try{
        //find the email from db collection (i.e user_details)
        const userEmail = await collection.findOne({email});
        if(!userEmail){
            return sendNotFoundError(res);
        }

         //4-digit OTP
         const otp = await generateUniqueOtp();
        // Hash the OTP
        const hashedOtp = await bcrypt.hash(otp, 10);
        //opt expire time
        const tokenExpiration = Date.now() + 36000000;//user date fns

        //update the user with reset token in database
        userEmail.password = hashedOtp;
        userEmail.resetPasswordExpires = tokenExpiration;
        await userEmail.save();

        //send email with password reset link using nodemailer
        const transporter = nodeMailer.createTransport({
            service : 'Gmail',
            auth :{
                user: process.env.EMAIL,
                pass : process.env.EMAIL_PASSWORD, 
            },
        });
        const mailOptions = {
            to :userEmail.email,
            from:process.env.EMAIL,
            subject : 'password reset',
            text: `the password for your express api account.\n\n
            Your OTP is: ${otp}\n\n
            Please use this OTP within 1 hour to reset your password. If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        //send email with token
        await transporter.sendMail(mailOptions);
        return emailSuccess(res);  
}catch (error) {
    console.error('Error during password reset:', error);
    return sendInternalServerError(res); // Send internal server error if something goes wrong
}
});

export default forgetPassword;