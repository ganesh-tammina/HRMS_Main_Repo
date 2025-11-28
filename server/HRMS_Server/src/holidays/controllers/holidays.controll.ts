import { Request, Response } from "express";
import XLSX from "xlsx";
import { HolidayService } from "../service/holidays.service";
import { Holiday } from "../interface/holidays.interface";
import fs from "fs";

export class HolidayController {

    // ✅ Upload and Insert Holidays (Excel file)
    static async uploadHolidays(req: Request, res: Response) {
        try {
            console.log("File => ", req.file);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            // Read Excel
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "Excel file contains no sheet"
                });
            }

            const sheet: any = workbook.Sheets[sheetName];

            const rawData = XLSX.utils.sheet_to_json<any>(sheet);

            if (!rawData || rawData.length === 0) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "Excel is empty"
                });
            }

            console.log("Raw Excel Data =>", rawData);

            // ✅ Map Excel data to DB format
            const holidays: Holiday[] = rawData.map((row: any) => ({
                holiday_date: row.hOLIDAY_DATE || row.holiday_date || row.Date || '',
                holiday_name: row.hOLIDAY_NAME || row.holiday_name || row.Holiday || '',
                day_name: row.dAY || row.day_name || row.Day || '',
                description: row.dESCRIPTION || row.description || ''
            }));

            console.log("Mapped Holidays =>", holidays);

            const rowsInserted = await HolidayService.bulkInsert(holidays);

            // Delete uploaded file
            fs.unlinkSync(req.file.path);

            return res.status(201).json({
                success: true,
                message: "Holidays uploaded successfully",
                rows: rowsInserted
            });

        } catch (error: any) {
            console.error("UPLOAD ERROR =>", error);

            return res.status(500).json({
                success: false,
                message: error.message || "Server Error"
            });
        }
    }

    // ✅ Get All Holidays
    static async getHolidays(req: Request, res: Response) {
        try {
            const holidays = await HolidayService.getAll();

            return res.status(200).json({
                success: true,
                data: holidays
            });

        } catch (error) {
            console.error("GET ERROR =>", error);
            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }

    // ✅ Delete Holiday by ID
    static async deleteHoliday(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ID"
                });
            }

            await HolidayService.deleteById(id);

            return res.status(200).json({
                success: true,
                message: "Holiday deleted successfully"
            });

        } catch (error) {
            console.error("DELETE ERROR =>", error);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    }
}
