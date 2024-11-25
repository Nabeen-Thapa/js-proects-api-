import viewBlog from "../controllers/view-blog";
import addBlog from "../controllers/add-blog";
import express, { Router } from "express";

const apiBlogRoutes:Router = express.Router();

apiBlogRoutes.use(addBlog);
apiBlogRoutes.use(viewBlog);

export default apiBlogRoutes;