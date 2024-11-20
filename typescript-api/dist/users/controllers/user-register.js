"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("src/common/utils/logger"));
const userTable_1 = require("../db/userTable");
const DB_details_1 = require("src/common/db/DB_details");
const userRegister = express_1.default.Router();
userRegister.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // logger.info(`Request Method: ${req.method} | Request URL: ${req.originalUrl}`);
    logger_1.default.info("Request Body: ", req.body);
    try {
        const checkUserOnDB = DB_details_1.dbDetails.getRepository(userTable_1.User);
        // Check if user already exists
        const isExistUser = yield checkUserOnDB.findOne({
            where: {
                email: req.body.email,
                phone: req.body.phone,
                username: req.body.username,
            },
        });
        if (isExistUser) {
            return res
                .status(http_status_codes_1.StatusCodes.CONFLICT) // 409 Conflict
                .json({ message: "User already exists!" });
        }
        if (!req.body.password) {
            return res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ message: "Password is required." });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        // Create new user instance
        const newUser = checkUserOnDB.create({
            name: req.body.name,
            fullName: req.body.fullName,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            phone: req.body.phone,
            age: parseInt(req.body.age, 10),
            dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
            gender: req.body.gender,
        });
        // Save the new user
        yield checkUserOnDB.save(newUser);
        return res
            .status(http_status_codes_1.StatusCodes.CREATED) // 201 Created
            .json({ message: "Registration successful" });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR) // 500 Internal Server Error
            .json({ message: "An error occurred during registration." });
    }
}));
exports.default = userRegister;
//# sourceMappingURL=user-register.js.map