import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../db/userTable";
import logger from "../../common/utils/logger";
import { dbDetails } from "../../common/db/DB_details";
import bcrypt from 'bcrypt';
import userValidation from "./user-validation";
import { sendEmail } from "../utils/sendEmail";
import { generateUniqueOtp } from "../utils/otpGenerator";

const dataSource = dbDetails;
const userRegister: Router = express.Router();


// Define the UserRegisterRequest interface to specify the expected structure of the request body
interface UserRegisterRequest {
  name: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  age: string;
  dateOfBirth: string;
  gender: string;
  profileImage: any;
}


//email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

userRegister.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, phone, username, name, fullName, age, dateOfBirth, profileImage, gender }: UserRegisterRequest = req.body;
  //user data validation using joi
  const { error } = userValidation.validate(req.body);
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  try {
    const checkUserOnDB = dbDetails.getRepository(User);
    // Validate required fields
    if (!email || !phone || !username) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Email, phone, username, and password are required." });
      return; // exit early
    }

    // validate email 
    if (!isValidEmail(email)) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email format." });
    }

    // Check if user already exists
    const isExistUser = await checkUserOnDB.findOne({
      where: { email, phone, username },
    });

    if (isExistUser) {
      res.status(StatusCodes.CONFLICT).json({ message: "User already exists!" });
      return;
    }
    //4-digit OTP
    const otp = await generateUniqueOtp();
    // Hash the password
    const hashedPassword = await bcrypt.hash(otp, 10);

    //send email
    try {
      await sendEmail({
        to: email,
        subject: "Password Reset",
        text: `The password for your Typescript API account.\n\n
        Your username: ${username}\n
        Your OTP is: ${otp}\n\n
        Please use this OTP to log in or reset your password.\n`,
      });
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

    // Create new user instance
    const newUser = checkUserOnDB.create({
      name,
      fullName,
      email,
      username,
      password: hashedPassword,
      phone,
      age: parseInt(age, 10),
      dateOfBirth,
      gender,
      profileImage: profileImage || "", // Default to empty string if null or undefined    
    });

    // Save the new user
    await checkUserOnDB.save(newUser);

    // Send successful response
    res.status(StatusCodes.CREATED).json({ message: "Registration successful check your eail for the password" });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during registration." });
  }
});
export default userRegister;
