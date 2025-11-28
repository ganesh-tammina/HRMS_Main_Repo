import { Request, Response } from "express";
import XLSX from "xlsx";
import { HolidayService } from "../service/holidays.service";
import { Holiday } from "../interface/holidays.interface";
import fs from "fs";

export class HolidayController {

    static async uploadHolidays(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames?.[0];
            if (!sheetName) {
                // cleanup uploaded file and return a meaningful error when there are no sheets
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "Excel file contains no sheets" });
            }
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                // cleanup uploaded file and return a meaningful error when the sheet is missing
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "Specified sheet not found" });
            }

            const rawData = XLSX.utils.sheet_to_json<any>(sheet);

            if (!rawData.length) {
                return res.status(400).json({ success: false, message: "Excel is empty" });
            }

            const holidays: Holiday[] = rawData.map(row => ({
                holiday_date: row.holiday_date,
                holiday_name: row.holiday_name,
                day_name: row.day_name,
                description: row.description || ""
            }));

            const rowsInserted = await HolidayService.bulkInsert(holidays);

            // delete file after processing
            fs.unlinkSync(req.file.path);

            res.status(201).json({
                success: true,
                message: "Holidays uploaded successfully",
                rows: rowsInserted
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }

    static async getHolidays(req: Request, res: Response) {
        try {
            const holidays = await HolidayService.getAll();
            res.status(200).json({ success: true, data: holidays });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    }

    static async deleteHoliday(req: Request, res: Response) {
        try {
            const idParam = req.params.id;
            if (!idParam) {
                return res.status(400).json({ success: false, message: "Missing id parameter" });
            }

            const id = Number(idParam);
            if (Number.isNaN(id)) {
                return res.status(400).json({ success: false, message: "Invalid id parameter" });
            }

            await HolidayService.deleteById(id);
            res.status(200).json({ success: true, message: "Deleted" });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    }
}
