import { dbDetails } from "../../common/db/DB_details";
import express, { Request, Response, Router} from "express";
import { User } from "../db/userTable";
import { StatusCodes } from "http-status-codes";
import { generateUniqueOtp } from "../utils/otpGenerator";
import { sendEmail } from "../utils/emailSender";
import logger from "../../common/utils/logger";
import { finsAndDeleteKey } from "../utils/redisDataDelete";
import bcrypt from "bcrypt";
import { Tokens } from "../db/tokenTable";


const forgetPassword:Router = express.Router();

forgetPassword.post("/forget-password", async (req:Request, res:Response):Promise<void> =>{
    const {email} = req.body;
    if(!email){
        res.status(StatusCodes.BAD_REQUEST).json({message: "email is require"});
        return;
    }
    //excess db
    try {
        const accessUserDB = await dbDetails.getRepository(User);
    const isUserExist = await accessUserDB.findOne({where :{ email}});
    if(!isUserExist){
        res.status(StatusCodes.UNAUTHORIZED).json({message: "thie email is not exist"});
        return;
    }
    const username = isUserExist.username;
    const otp = await generateUniqueOtp();
    try {
        await sendEmail({
            to:email,
            subject: "Password Reset",
            text: `The password for your Typescript API account.\n\n
            Your username: ${username}\n
            Your OTP is: ${otp}\n\n
            Please use this OTP to log in or reset your password.\n`,
        })
    } catch (error) {
        if (error instanceof Error) {
            // Check if the error is an instance of Error
            logger.error("Email sending failed:", error.message);
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
          } else {
            // Handle non-Error cases (unlikely, but good practice)
            logger.error("Unexpected email sending error:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Unexpected error occurred while sending email." });
          }
          return;
    }
    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update the User table with the hashed OTP
    await accessUserDB.update({ email }, { password: hashedOtp });
    //delete from redis
    const deleteRedisKey = await finsAndDeleteKey(username);
    const getTokenTable = await dbDetails.getRepository(Tokens);
        const isLoggedIn = await getTokenTable.findOne({ where: { username } });
        if (isLoggedIn) {
            const userId = isLoggedIn.userId;
            await getTokenTable.delete({ userId });   
        }
        res.status(StatusCodes.OK).json({ message: "successfully forget password check your gmail for password and login to continue" });
        return;
    } catch (error) {
         logger.error("forget password error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during forget passowrd." });
    }

});

export default forgetPassword;