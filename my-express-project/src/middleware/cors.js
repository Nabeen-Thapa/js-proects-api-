import cors from 'cors';
import express from 'express';
const corsRoute = express();
// Enable CORS for the frontend running on port 3000
corsRoute.use(cors({
  origin: 'http://localhost:4000',  // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies and session headers
}));
export default corsRoute;