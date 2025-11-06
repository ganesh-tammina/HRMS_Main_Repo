"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
const poolOptions = {
    host: env_1.config.DB_HOST,
    user: env_1.config.DB_USER,
    password: env_1.config.DB_PASSWORD,
    database: env_1.config.DB_NAME,
    port: env_1.config.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
exports.pool = promise_1.default.createPool(poolOptions);
//# sourceMappingURL=database.js.map