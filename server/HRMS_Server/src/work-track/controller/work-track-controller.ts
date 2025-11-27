import { Request, Response } from "express";
import { WorkTrack } from "../interface/work-track";
import { WorkTrackService } from "../services/work-track.service";

export class WorkTrackController {
  static async saveWorkTrack(req: Request, res: Response) {
    const workTrackData: WorkTrack = req.body;
    try {
      const result = await WorkTrackService.saveWorkReport(workTrackData);
      res.status(201).json({ message: 'Work report saved successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  static async getWorkTrack(req: Request, res: Response) {
    const workTrackData: WorkTrack = req.body;
    try {
      const result = await WorkTrackService.getWorkReport(workTrackData.employee_id, workTrackData.date);
      res.status(201).json({ message: 'Work report saved successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllWorkTrack(req: Request, res: Response) {
    const workTrackData: WorkTrack = req.body;
    try {
      const result = await WorkTrackService.getAllWorkReport(workTrackData.employee_id);
      res.status(201).json({ message: 'Work report saved successfully', data: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
