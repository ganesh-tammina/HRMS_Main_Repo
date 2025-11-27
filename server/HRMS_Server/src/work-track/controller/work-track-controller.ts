import { Request, Response } from "express";
import { WorkTrack } from "../interface/work-track";
import { WorkTrackService } from "../services/work-track.service";

export class WorkTrackController {
  public static async saveWorkTrack(req: Request, res: Response) {
    const workTrackData: WorkTrack = req.body; 
    try {
        const result = await WorkTrackService.saveWorkReport(workTrackData);
        res.status(201).json({ message: 'Work report saved successfully', data: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
  }

  public static async getWorkReportsByEmployeeId(req: Request, res: Response) {
    const { employee_id } = req.body;
    try {
        const workReports = await WorkTrackService.getWorkReportsByEmployeeId(employee_id);
        res.status(200).json({ workReports });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
  }

  public static async getWorkReportsByDateRange(req: Request, res: Response) { 
    const { employee_id, startDate, endDate } = req.body;
    try {
        const result = await WorkTrackService.getWorkReportsByDateRange(Number(employee_id), startDate, endDate);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
  }
}
