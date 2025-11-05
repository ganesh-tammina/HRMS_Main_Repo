import { Request, Response } from 'express';
import LeaveService from '../services/leave.services';

export default class LeaveController {
  public static async createLeaveBalance(req: Request, res: Response) {
    try {
      const result = await LeaveService.createLeaveBalance(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  public static async createLeaveRequest(req: Request, res: Response) {
    try {
      const result = await LeaveService.createLeaveRequest(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  public static async getLeaveBalances(_req: Request, res: Response) {
    console.log('getLeaveBalances called');
    try {
      const result = await LeaveService.getLeaveBalances();
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  public static async getLeaveRequests(_req: Request, res: Response) {
    try {
      const result = await LeaveService.getLeaveRequests();
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async addLeaves(req: Request, res: Response) {
    try {
      const result = await LeaveService.addLeaves(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getLeaves(req: Request, res: Response) {
    try {
      const result = await LeaveService.getLeaveBalance(req.body.employeeId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
  public static async getLeaveRequest(req: Request, res: Response) {
    try {
      const result = await LeaveService.getLeaveRequestById(req.body.employeeId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
