"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_register_1 = __importDefault(require("../controllers/user-register"));
const apiRouter = express_1.default.Router();
// Combine all routes here
apiRouter.use(user_register_1.default);
exports.default = apiRouter;
//# sourceMappingURL=userApiRoutes.js.map