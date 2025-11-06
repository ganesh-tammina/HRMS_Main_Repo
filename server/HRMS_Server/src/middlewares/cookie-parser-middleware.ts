import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import LoginService from '../services/employee-login-service';
import CheckerCrocodile from '../helpers/verification-helper';
import { decode } from 'punycode';
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
  // not implemented yet, still work need to be done.
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
  if (!req.body?.email) {
    res.json('Nope, invalid request.').status(500);
  } else {
    req.body.email = req.body?.email;
    next();
  }
}

export function checkIfIamEmployeeAtAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body?.email) {
    res.json('Nope, invalid request.').status(500);
  } else {
    if (req.body.email === config.ADMIN_ID) {
      return IAM_GROOT(req, res, 'NOTLOGIN');
    }
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
      req.body.email = req.cookies?.employee_email;
      const t = await LoginService.login(req, res);
    }
  }
}
export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.body?.access_token;
    const refreshToken = req.body?.refresh_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Access token missing' });
    }
    // if (!refreshToken) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: 'Refresh token missing' });
    // }
    const decoded: any = jwt.verify(token, config.JWT_TOKEN);
    const jwt_check = await LoginService.isTokenActive(token);
    if (jwt_check) {
      (req as any).employee = decoded;
      (req.body as any).id = decoded.employee_id;

      next();
    } else {
      (req as any).employee = decoded;
      (req.body as any).id = decoded.employee_id;
      next();
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
