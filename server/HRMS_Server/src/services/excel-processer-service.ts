import xlsx, { WorkBook, WorkSheet } from "xlsx";
import fs from "fs";
import path from "path";

export interface ExcelProcessResult {
  success: boolean;
  message: string;
  sheetName?: string;
  rowCount?: number;
  data?: any[];
  error?: string;
  details?: string;
}

export class ExcelProcessorService {
  public static async extractData(
    file: Express.Multer.File
  ): Promise<ExcelProcessResult> {
    const filePath = file.path;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    try {
      const allowedExtensions = [".xlsx", ".xls"];
      const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (
        !allowedExtensions.includes(fileExt) ||
        !allowedMimeTypes.includes(mimeType)
      ) {
        return {
          success: false,
          message:
            "Invalid file type. Only Excel (.xls, .xlsx) files are allowed.",
        };
      }
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: "Uploaded file not found on server.",
        };
      }
      let workbook: WorkBook;
      try {
        workbook = xlsx.readFile(filePath, { cellDates: true });
      } catch (err: any) {
        return {
          success: false,
          message: "Invalid or corrupted Excel file.",
          error: err.message,
        };
      }
      const sheetNames = workbook.SheetNames;
      if (!sheetNames.length) {
        return { success: false, message: "No sheets found in Excel file." };
      }
      const sheetName = sheetNames[0] || "";
      const worksheet: WorkSheet | undefined = workbook.Sheets[sheetName];
      if (!worksheet) {
        return {
          success: false,
          message: `Sheet "${sheetName}" is invalid or empty.`,
        };
      }
      let sheetData: any[];
      try {
        sheetData = xlsx.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false,
          blankrows: false,
        });
      } catch (err: any) {
        return {
          success: false,
          message: "Failed to parse sheet data.",
          error: err.message,
        };
      }
      if (!sheetData.length) {
        return {
          success: false,
          message: "Sheet is empty, no data to process.",
        };
      }
      return {
        success: true,
        message: "Excel file processed successfully.",
        sheetName,
        rowCount: sheetData.length,
        data: sheetData,
      };
    } catch (err: any) {
      console.error("Unexpected error while processing Excel file:", err);
      return {
        success: false,
        message: "Unexpected error while processing Excel file.",
        error: err.message,
      };
    } finally {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupErr) {
        console.warn("File cleanup failed:", cleanupErr);
      }
    }
  }
}
