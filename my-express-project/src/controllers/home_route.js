import express from "express";
const homeRute = express.Router();
import { authenticateToken } from '../middleware/authenticate_token.js';
import { checkRedisData } from "../middleware/check_redis_data.js";

homeRute.use(checkRedisData)

homeRute.get('/home', authenticateToken, (req,res)=>{
    res.json({ message: `Hello, ${req.user.username}! This is a protected route.` });
   // res.render('home', { username: req.session.username });
});

export default homeRute;