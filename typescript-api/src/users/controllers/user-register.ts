import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../db/userTable";
import logger from "../../common/utils/logger";
import { dbDetails } from "../../common/db/DB_details";
import nodeMailer from 'nodemailer';
import bcrypt from 'bcrypt'; 
import { authenticator } from 'otplib';

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
}
const userRegister: Router = express.Router();
//opt generator
const dataSource= dbDetails;

async function generateUniqueOtp(): Promise<string> {
  let otp: string;
  let userWithSameOtp: User | null;

  // Get the user repository
  const userRepository = dataSource.getRepository(User);

  do {
    otp = authenticator.generateSecret().slice(0, 4); // Generate a 4-digit OTP (as a string)
    // Check if any user exists with the same OTP (in the password field or another field)
    userWithSameOtp = await userRepository.findOne({
      where: { password: otp }, // Change "password" to the field where OTP is stored
    });
  } while (userWithSameOtp); // Repeat if OTP exists

  return otp; // Return the unique OTP
}
userRegister.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, phone, username, password, name, fullName, age, dateOfBirth, gender }: UserRegisterRequest = req.body;
  //logger.info("Request Body: ", req.body);

  try {
    const checkUserOnDB = dbDetails.getRepository(User);

    // Validate required fields
    if (!email || !phone || !username || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Email, phone, username, and password are required." });
      return; // exit early
    }

    // Check if user already exists
    const isExistUser = await checkUserOnDB.findOne({
      where: { email, phone, username },
    });

    if (isExistUser) {
      res.status(StatusCodes.CONFLICT).json({ message: "User already exists!" });
      return; // exit early
    }
    //4-digit OTP
    const otp = await generateUniqueOtp();
    // Hash the password
    const hashedPassword = await bcrypt.hash(otp, 10);
    // const hashedPassword = await bcrypt.hash(password, 10);

    //send email
    const transporter = nodeMailer.createTransport({
      service : 'Gmail',
        auth :{
          user: process.env.EMAIL,
          pass : process.env.EMAIL_PASSWORD, 
        },
    });
    const mailOptions = {
      to :email,
      from:process.env.EMAIL,
      subject : 'password reset',
      text: `the password for your typescript api account.\n\n
      Your OTP is: ${otp}\n\n
      Please use this OTP within 1 hour to reset your password. If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  //send email with token
  await transporter.sendMail(mailOptions);
   res.status(StatusCodes.CREATED).json({ message: "email send successful" });
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
    });

    // Save the new user
    await checkUserOnDB.save(newUser);

    // Send successful response
    res.status(StatusCodes.CREATED).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during registration." });
  }
});

export default userRegister;
