import { Request, Response } from "express";
import * as XLSX from "xlsx";
import { PayslipService } from "../services/payslip_service";
import { PaySlip } from "../interface/payslip_interface";

export class PayslipController {

    static async uploadExcel(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                return res.status(400).json({ message: "Uploaded Excel file contains no sheets" });
            }
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                return res.status(400).json({ message: "Sheet not found in uploaded Excel file" });
            }
            const sheet = XLSX.utils.sheet_to_json(worksheet) as PaySlip[];

            const inserted = await PayslipService.uploadPayslips(sheet);

            res.json({
                message: "Upload successful",
                inserted_rows: inserted
            });

        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error
            });
        }
    }
}
