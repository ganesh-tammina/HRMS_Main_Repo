import { Request, Response } from "express";
import { ExcelProcessorService } from "../services/excel-processer-service";

export default class AdminController{

  public static async uploadExcel(req: Request, res: Response): Promise<any> {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded." });
      }
      const result = await ExcelProcessorService.extractData(req.file);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    } catch (err: any) {
      console.error("Controller error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: err.message,
      });
    }
  }


}
