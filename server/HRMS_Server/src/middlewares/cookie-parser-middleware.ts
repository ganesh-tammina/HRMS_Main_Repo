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
export function checkIfIamValidEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.cookies?.employee_email || !req.cookies?.employee_id) {
    res.json("Nope, invalid request.").status(500);
  } else {
    console.log("tested");
    req.body.email = req.cookies?.employee_email;
    next();
  }
}

export function checkIfIamEmployeeAtAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.cookies?.employee_email) {
    res.json("Nope, invalid request.").status(500);
  } else {
    console.log("tested");
    req.body.email = req.cookies?.employee_email;
    next();
  }
}
