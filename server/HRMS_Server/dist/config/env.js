"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    PORT: Number(process.env.PORT),
    DB_NAME: process.env.DB_NAME || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_HOST: process.env.DB_HOST || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    DB_PORT: Number(process.env.DB_PORT) || 3306,
    JWT_TOKEN: process.env.JWT_TOKEN || '',
    ADMIN_ID: process.env.ADMIN_ID || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
};
if (!exports.config.DB_NAME || !exports.config.DB_USER || !exports.config.DB_PASSWORD) {
    console.log('Invalid DB Credentials.');
}
//# sourceMappingURL=env.js.map