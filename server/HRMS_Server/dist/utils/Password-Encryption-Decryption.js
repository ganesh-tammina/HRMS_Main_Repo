"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordUtil {
    static async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt_1.default.hash(password, saltRounds);
    }
    static async verifyPassword(password, hashedPassword) {
        return await bcrypt_1.default.compare(password, hashedPassword);
    }
}
exports.PasswordUtil = PasswordUtil;
//# sourceMappingURL=Password-Encryption-Decryption.js.map