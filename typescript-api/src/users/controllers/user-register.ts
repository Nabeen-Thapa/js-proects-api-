import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../db/userTable";
import logger from "../../common/utils/logger";
import { dbDetails } from "../../common/db/DB_details";
import nodeMailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import userValidation from "./user-validation";
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


async function generateUniqueOtp(): Promise<string> {
  let otp: string;
  let userWithSameOtp: User | null;

  // Get the user repository
  const userRepository = dataSource.getRepository(User);

  do {
    otp = authenticator.generateSecret().slice(0, 4); // Generate a 4-digit OTP 
    // Check if any user exists with the same OTP 
    userWithSameOtp = await userRepository.findOne({
      where: { password: otp }, // Change "password" to the field where OTP is stored
    });
  } while (userWithSameOtp); // Repeat if OTP exists

  return otp;
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
    const transporter = nodeMailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: 'password reset',
      text: `the password for your typescript api account.\n\n
      your username:${username}\n
      Your OTP is: ${otp}\n\n
      Please use this OTP  to login or reset your password.\n`,
    };
    //send email with token
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // Check for specific email error conditions
      if ((emailError as any).response) {
        const response = (emailError as any).response;
        if (response.includes('550') || response.includes('5.1.1')) {
          res.status(StatusCodes.BAD_REQUEST).json({
            message: `Address not found: The email ${email} is not valid.`,
          });
          return; // Exit early if the email is invalid
        }
      }
      // If email sending failed, return a generic error message
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Failed to send email. Please check the email address and try again.",
      });
      return; // Exit early
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
