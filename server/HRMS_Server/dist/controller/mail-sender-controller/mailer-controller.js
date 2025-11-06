"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailer_service_1 = require("../../services/mail-sender-service/mailer-service");
class MailController {
    static async mailsender(req, res) {
        const { to, subject, text } = req.body;
        if (!to || !subject || !text) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields (to, subject, text)",
            });
        }
        try {
            const result = await (0, mailer_service_1.sendMail)(to, subject, text, `<p>${text}</p>`);
            res.json({ success: true, messageId: result.messageId });
        }
        catch (error) {
            res.status(500).json({ success: false, error: "Failed to send email" });
        }
    }
}
exports.default = MailController;
//# sourceMappingURL=mailer-controller.js.map