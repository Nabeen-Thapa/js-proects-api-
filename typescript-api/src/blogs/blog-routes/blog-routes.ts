import addBlog from "../controllers/add-blog";
import express, { Router } from "express";

const apiBlogRoutes:Router = express.Router();

apiBlogRoutes.use(addBlog);

export default apiBlogRoutes;