"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_controller_1 = __importDefault(require("../controller/mail-sender-controller/mailer-controller"));
const router = (0, express_1.Router)();
// POST /send-email
router.post("/send-email", mailer_controller_1.default.mailsender);
exports.default = router;
//# sourceMappingURL=mail-route.js.map