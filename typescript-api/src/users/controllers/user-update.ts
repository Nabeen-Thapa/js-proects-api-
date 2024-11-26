import express, { Request, Response, Router } from "express";
import userValidation from "./user-validation";
import { StatusCodes } from "http-status-codes";
import { dbDetails } from "../../common/db/DB_details";
import { User } from "../db/userTable";
import logger from "../../common/utils/logger";
import { uploadLoggedInDataInRedis } from "../../common/utils/redis_data_upload";
import { Not } from "typeorm";

const UpdateUser: Router = express.Router();

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

UpdateUser.put("/update-user", async (req: Request, res: Response): Promise<void> => {
  const { email, phone, username, name, fullName, age, dateOfBirth, profileImage, gender }: UserRegisterRequest = req.body;

  const { error } = userValidation.validate(req.body);
  if (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation failed",
      details: error.details.map((detail) => detail.message),
    });
    return;
  }

  if (!email || !phone || !username) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Email, phone, username are required." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email format." });
    return;
  }

  try {
    const isUserLoggedIn = await uploadLoggedInDataInRedis(username);
    if (!isUserLoggedIn) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "This user is not logged in." });
      return;
    }

    const checkUserOnDB = dbDetails.getRepository(User);
    const isExistUser = await checkUserOnDB.findOne({ where: { email } });

    if (!isExistUser) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found in database." });
      return;
    }

    // Check for duplicate unique fields
    const duplicateUser = await checkUserOnDB.findOne({
      where: [
        { email, userId: Not(isExistUser.userId) },
        { username, userId: Not(isExistUser.userId) }
      ],
    });

    if (duplicateUser) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Duplicate email, phone, or username already exists.",
      });
      return;
    }

    // Update user details
    isExistUser.name = name;
    isExistUser.fullName = fullName;
    isExistUser.email = email;
    isExistUser.phone = phone;
    isExistUser.age = parseInt(age, 10);
    isExistUser.dateOfBirth = new Date(dateOfBirth);
    isExistUser.gender = gender;
    isExistUser.profileImage = profileImage || "";

    await checkUserOnDB.save(isExistUser);

    res.status(StatusCodes.OK).json({ message: "User update successful." });
  } catch (error: any) {
    if (error.code === "23505") { // PostgreSQL unique constraint error
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Duplicate value violates unique constraints.",
        details: error.detail || error.message,
      });
    } else {
      logger.error("update user error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred during update user.",
      });
    }
  }
});

export default UpdateUser;