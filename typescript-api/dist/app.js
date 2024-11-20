"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./common/utils/logger"));
const app = (0, express_1.default)();
const appPort = process.env.appPost;
app.listen(appPort, () => {
    logger_1.default.info(`server port is starting on ${appPort}`);
});
//# sourceMappingURL=app.js.map