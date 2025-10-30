import { Request, Response, NextFunction } from 'express';

export function kjhkhk(req: Request, res: Response, next: NextFunction) {
  if (!req.body?.EmpID || !req.body?.LogType) {
    return res
      .status(400)
      .json({ success: false, error: 'EmpID and LogType are required' });
  }
  next();
}
