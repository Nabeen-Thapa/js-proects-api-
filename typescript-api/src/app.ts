import "reflect-metadata";
import express, { Request, Response } from "express";
import logger from "./common/utils/logger";
import apiUserRouter from "./users/userRoutes/userApiRoutes";
import dotenv from 'dotenv';
import { dbDetails } from "./common/db/DB_details";
import apiBlogRoutes from "./blogs/blog-routes/blog-routes";
dotenv.config();
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

dbDetails.initialize()
  .then(() => {
    logger.info("Database connected successfully!");
  })
  .catch((error) => {
    logger.error("Error during Data Source initialization:", error);
  });


//router for all /api routes
app.use('/api', apiUserRouter);
app.use('/api',apiBlogRoutes);

const apiPort = process.env.AppPort || 3200;
app.listen(apiPort, () => {
  logger.info(`Server running on port ${apiPort}`);
});
