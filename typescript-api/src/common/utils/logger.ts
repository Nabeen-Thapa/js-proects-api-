// common/utils/logger.ts
import winston from 'winston';

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/app.log' }) // Log to a file
  ],
});

// For production, log only errors to the console
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({ level: 'error' }));
}

export default logger;
