import { dbDetails } from "../../common/db/DB_details";
import { uploadLoggedInDataInRedis } from "../../common/utils/redis_data_upload";
import express, { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../db/userTable";
import logger from "../../common/utils/logger";

const viewUser:Router = express.Router();

viewUser.get("/view-user", async (req:Request, res:Response):Promise<void>=>{
    const {username} = req.body;
    if(!username){
        res.status(StatusCodes.BAD_REQUEST).json({ message: "username is required "});
      return;
    }
    try {
        const isUserLoggedIn = await uploadLoggedInDataInRedis(username);
    if (!isUserLoggedIn) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "This user is not logged in." });
      return;
    }
    const checkUserOnDB = dbDetails.getRepository(User);
    const isExistUser = await checkUserOnDB.findOne({ where: { username } });

    if (!isExistUser) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found in database." });
      return;
    }

    res.json({
        message: "user details",
        fullName : isExistUser.fullName,
        name :isExistUser.name,
        Email :isExistUser.email,
        username:isExistUser.username,
      phone :isExistUser.phone,
      age: isExistUser.age,
      dateOfBirth: isExistUser.dateOfBirth,
      gender:isExistUser.gender,
    });

    } catch (error) {
        logger.error("view user error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during view user." });
    }
})
export default viewUser;
