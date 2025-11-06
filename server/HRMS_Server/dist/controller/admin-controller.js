"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const excel_processer_service_1 = require("../services/excel-processer-service");
class AdminController {
    static async uploadExcel(req, res) {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ success: false, message: "No file uploaded." });
            }
            const result = await excel_processer_service_1.ExcelProcessorService.extractData(req.file);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        }
        catch (err) {
            console.error("Controller error:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error.",
                error: err.message,
            });
        }
    }
}
exports.default = AdminController;
//# sourceMappingURL=admin-controller.js.map