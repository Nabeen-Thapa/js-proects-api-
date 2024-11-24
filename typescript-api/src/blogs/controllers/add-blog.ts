import express, {  Request, Response, Router } from "express";

const addBlog:Router = express.Router();

addBlog.post("/add-blog", async(req:Request, res:Response):Promise<void>=>{
    
});

export default addBlog;

