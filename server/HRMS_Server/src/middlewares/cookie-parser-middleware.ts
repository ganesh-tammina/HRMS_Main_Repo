import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import LoginService from '../services/employee-login-service';
import CheckerCrocodile from '../helpers/verification-helper';
export function checkWhoAmI(req: Request, res: Response, next: NextFunction) {
  if (req.body.email == config.ADMIN_ID) {
    IAM_GROOT(req, res, 'LOGIN');
  } else next();
}
export async function checkMyRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const employee_ID = await CheckerCrocodile.RoleChecker(req, res);
  console.log('check role');
  const id = parseInt(req.cookies?.id);

  if (id != 2026) {
    req.body = { id: id };
    next();
  } else next();
}
export function checkIfIamValidEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.cookies?.employee_email || !req.cookies?.employee_id) {
    res.json('Nope, invalid request.').status(500);
  } else {
    console.log('tested and found mail');
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
    res.json('Nope, invalid request.').status(500);
  } else {
    console.log('tested +ve for employee');
    if (req.cookies?.employee_email === config.ADMIN_ID) {
      return IAM_GROOT(req, res, 'NOTLOGIN');
    }
    req.body.email = req.cookies?.employee_email;
    next();
  }
}

async function IAM_GROOT(
  req: Request,
  res: Response,
  type: 'LOGIN' | 'NOTLOGIN'
) {
  if (type === 'LOGIN') {
    res.cookie('employee_email', req.body.email);
    res.status(200).json({
      success: true,
      type: 'existing_employee',
      message: 'Existing employee found.',
    });
  } else if (type === 'NOTLOGIN') {
    if (req.body.password === config.ADMIN_PASSWORD) {
      console.log('coming');

      req.body.email = req.cookies?.employee_email;
      const t = await LoginService.login(req, res, true);
    }
  }
}
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Access token missing' });
    }
    const decoded = jwt.verify(token, config.JWT_TOKEN);
    (req as any).employee = decoded;
    checkMyRole(req, res, next);
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
