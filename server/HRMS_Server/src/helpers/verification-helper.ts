import { Request, Response } from 'express';
import { pool } from '../config/database';
import LoginService from '../services/employee-login-service';
export default class CheckerCrocodile {
  public static async RoleChecker(req: Request, res: Response): Promise<any> {
    // if (await LoginService.isTokenActive(req.cookies?.access_token)) {
    //   const employee = await LoginService.refreshToken(req, res);
    //   res.json(employee);
    // //   return employee.employee_id;
    // } else {
    //   const employee = await LoginService.refreshToken(req, res);
    //   res.json({ employee, abc: 'asdf' });
    // //   return employee.employee_id;
    // }

    
  }
}
