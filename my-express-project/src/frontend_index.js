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
const app = express();
const apiRoute = express.Router();

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

validateEnvAppPort();

const port = process.env.frontendPort;
app.listen(port, () => {
    logger.info(`App is running at port: ${port}`);
});

