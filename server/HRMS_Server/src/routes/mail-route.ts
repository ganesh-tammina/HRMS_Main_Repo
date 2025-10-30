import { Router } from "express";
import MailController from "../controller/mail-sender-controller/mailer-controller";

const router = Router();

// POST /send-email
router.post("/send-email", MailController.mailsender);

export default router;