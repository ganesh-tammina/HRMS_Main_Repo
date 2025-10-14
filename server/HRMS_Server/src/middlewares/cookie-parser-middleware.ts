import { Request, Response, NextFunction } from "express";

export function checkWhoAmI(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.who) {
    console.log("tested");
    next();
  } else {
    res.json("error found").status(500);
  }
}

export function checkMyRole(req: Request, res: Response, next: NextFunction) {}
