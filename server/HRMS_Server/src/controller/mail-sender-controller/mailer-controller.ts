import { sendMail } from "../../services/mail-sender-service/mailer-service";
import { Request, Response } from "express";

export default class MailController {
  public static async mailsender(req: Request, res: Response) {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (to, subject, text)",
      });
    }
    try {
      const result = await sendMail(to, subject, text, `<p>${text}</p>`);
      res.json({ success: true, messageId: result.messageId });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  }
}
