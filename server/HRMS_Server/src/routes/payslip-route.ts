import { Router } from "express";
import multer from "multer";
import { PayslipController } from "../Payslips/Controlers/payslip_controller";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post("/upload-payslips", upload.single("file"), PayslipController.uploadExcel);

export default router;