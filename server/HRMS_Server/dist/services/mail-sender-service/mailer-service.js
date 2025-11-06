"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env_1.config.EMAIL_USER,
        pass: env_1.config.EMAIL_PASS,
    },
});
const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"My App" <${env_1.config.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("✅ Email sent:", info.messageId);
        return info;
    }
    catch (err) {
        console.error("❌ Error sending email:", err);
        throw err;
    }
};
exports.sendMail = sendMail;
//# sourceMappingURL=mailer-service.js.map