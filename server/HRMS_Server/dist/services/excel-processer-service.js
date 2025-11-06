"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelProcessorService = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ExcelProcessorService {
    static async extractData(file) {
        const filePath = file.path;
        const fileExt = path_1.default.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype;
        try {
            const allowedExtensions = [".xlsx", ".xls"];
            const allowedMimeTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ];
            if (!allowedExtensions.includes(fileExt) ||
                !allowedMimeTypes.includes(mimeType)) {
                return {
                    success: false,
                    message: "Invalid file type. Only Excel (.xls, .xlsx) files are allowed.",
                };
            }
            if (!fs_1.default.existsSync(filePath)) {
                return {
                    success: false,
                    message: "Uploaded file not found on server.",
                };
            }
            let workbook;
            try {
                workbook = xlsx_1.default.readFile(filePath, { cellDates: true });
            }
            catch (err) {
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
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                return {
                    success: false,
                    message: `Sheet "${sheetName}" is invalid or empty.`,
                };
            }
            let sheetData;
            try {
                sheetData = xlsx_1.default.utils.sheet_to_json(worksheet, {
                    defval: null,
                    raw: false,
                    blankrows: false,
                });
            }
            catch (err) {
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
        }
        catch (err) {
            console.error("Unexpected error while processing Excel file:", err);
            return {
                success: false,
                message: "Unexpected error while processing Excel file.",
                error: err.message,
            };
        }
        finally {
            try {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (cleanupErr) {
                console.warn("File cleanup failed:", cleanupErr);
            }
        }
    }
}
exports.ExcelProcessorService = ExcelProcessorService;
//# sourceMappingURL=excel-processer-service.js.map