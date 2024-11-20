import "reflect-metadata";
import express, { Request, Response } from "express";
import logger from "./common/utils/logger";
import apiUserRouter from "./users/userRoutes/userApiRoutes";
import dotenv from 'dotenv';
import { dbDetails } from "./common/db/DB_details";
dotenv.config();
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

dbDetails.initialize()
.then(() => {
  console.log("Database connected successfully!");
})
.catch((error) => {
  console.error("Error during Data Source initialization:", error);
});
// Use the router for all /api routes
app.use('/api', apiUserRouter);

// Set port from environment variable or fallback to default
const apiPort = process.env.AppPort || 3200;

app.listen(apiPort, () => {
    logger.info(`Server running on port ${apiPort}`);
});
