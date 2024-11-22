// index.js
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from './config.js';
import apiRouter from './routers/api_routes.js';
const app = express();
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { validateEnvAppPort } from './middleware/env_check.js';
import corsRoute from './middleware/cors.js';
app.use(corsRoute);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define __dirname for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine and views directory
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('login'); // Render login form
});

app.get('/register', (req, res) => {
    res.render('register'); // Render register form
});

app.get('/home', (req, res) => {
    res.render('home'); // Render home form
});

app.use(session({
    store: new RedisStore({ client: redisClient }), // Use Redis for session storage
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 24 * 10 * 1000 }, // Expire session in 10 days
})
);
app.use((req, res, next) => {
    console.log("Session Middleware Check:", req.session);
    next();
});

// Use apiRouter for all /api routes
app.use('/api', apiRouter);

validateEnvAppPort();

const port = process.env.PORT;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});

