import { Request, Response } from 'express';
import { WFHService } from '../services/wfh-service';

export class WFHController {
  public static async applyWorkFromHome(req: Request, res: Response) {
    try {
        const data = req.body;
        const result = await WFHService.applyWorkFromHome(data);
        res.status(200).json({ message: 'Work from home applied successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }   
  }
}