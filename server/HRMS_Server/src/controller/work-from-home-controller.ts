import { Request, Response } from 'express';
import { WorkFromHomeService } from '../services/work-from-home-service';

export class WorkFromHomeController {
  public static async applyWorkFromHome(req: Request, res: Response) {
    try {
      const data = req.body;
      const result = await WorkFromHomeService.applyWorkFromHome(data);
      res
        .status(200)
        .json({ message: 'Work from home applied successfully', result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getWFHRequestsByEmployeeId(req: Request, res: Response) {
    try {
      const employee_id = req.params?.empId;
      if (!employee_id) {
        return res.json('Invalid Request').status(500);
      }
      employee_id;
      const requests = await WorkFromHomeService.getWFHRequestsByEmployeeId(
        parseInt(employee_id)
      );
      res.status(200).json({ requests });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getAllWFHRequests(req: Request, res: Response) {
    try {
      const requests = await WorkFromHomeService.getAllWFHRequests();
      res.status(200).json({ requests });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async updateWFHRequestStatus(req: Request, res: Response) {
    try {
      const { notifier_id, request_id, status } = req.body;
      const result = await WorkFromHomeService.updateWFHRequestStatus(
        notifier_id,
        request_id,
        status
      );
      res
        .status(200)
        .json({ message: 'WFH request status updated successfully', result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async deleteWFHRequest(req: Request, res: Response) {
    try {
      const { request_id } = req.body;
      const result = await WorkFromHomeService.deleteWFHRequest(request_id);
      res
        .status(200)
        .json({ message: 'WFH request deleted successfully', result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getMyNotified(req: Request, res: Response) {
    const myId = req.params?.empId;
    if (!myId) {
      return 'Nothing to display, no id is passed.';
    }
    try {
      const result = await WorkFromHomeService.getMyNotified(myId);
      return res.json(result).status(200);
    } catch (e) {
      return res.json(e).status(500);
    }
  }
}
