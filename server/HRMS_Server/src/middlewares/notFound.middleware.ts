import { Request, Response, NextFunction } from "express";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    status: false,
    message: `Not Found - ${req.originalUrl}`,
  });
}
