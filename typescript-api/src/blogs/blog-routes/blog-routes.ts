import viewBlog from "../controllers/view-blog";
import addBlog from "../controllers/add-blog";
import express, { Router } from "express";
import deleteBLog from "../controllers/delete-blog";
import updateBlog from "../controllers/update-blog";

const apiBlogRoutes:Router = express.Router();

apiBlogRoutes.use(addBlog);
apiBlogRoutes.use(viewBlog);
apiBlogRoutes.use(deleteBLog);
apiBlogRoutes.use(updateBlog)

export default apiBlogRoutes;