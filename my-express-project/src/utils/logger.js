import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const environment = process.env.NODE_ENV || 'development';
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure the logs directory exists
if (!fs.existsSync(path.join(__dirname, '../logs'))) {
    fs.mkdirSync(path.join(__dirname, '../logs'));
}

// Path to the log file where user details will be stored
const logFilePath = path.join(__dirname, '../logs/user_data_log.json');

// Function to log user data to the log file
export const logUserDetails = (userData) => {
    const logEntry = {
        ...userData,
        timestamp: new Date().toISOString() // Add a timestamp
    };

    // Check if the log file exists; if not, create it with an empty array
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, JSON.stringify([]));
    }

    // Read the current contents of the log file
    let existingLogs;
    try {
        const fileContents = fs.readFileSync(logFilePath, 'utf-8');
        existingLogs = fileContents ? JSON.parse(fileContents) : [];
    } catch (error) {
        console.error('Error reading or parsing log file:', error);
        existingLogs = [];
    }

    // Append the new log entry
    existingLogs.push(logEntry);

    // Write the updated log file
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2)); // Pretty print JSON
};


const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'gray',
    },
}

const logger = createLogger({
    levels :customLevels.levels,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Timestamp format
        format.printf(({ timestamp, level, message}) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
    ]
});
// Enable colors in development
if (environment === 'development') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

// Add colors for custom log levels
import winston from 'winston';
winston.addColors(customLevels.colors);

export default logger;
