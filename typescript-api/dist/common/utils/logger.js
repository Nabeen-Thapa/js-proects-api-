"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// common/utils/logger.ts
const winston_1 = __importDefault(require("winston"));
// Create a logger instance
const logger = winston_1.default.createLogger({
    level: 'info', // Default log level
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console(), // Log to console
        new winston_1.default.transports.File({ filename: 'logs/app.log' }) // Log to a file
    ],
});
// For production, log only errors to the console
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston_1.default.transports.Console({ level: 'error' }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map