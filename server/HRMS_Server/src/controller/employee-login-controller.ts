import LoginService from '../services/employee-login-service';
import { Request, Response } from 'express';
export default class EmployeeLoginController {
  public static async EmailCheck(req: Request, res: Response) {
    try {
      await LoginService.emailCheck(req, res);
    } catch (error: any) {
      console.error('Error in email-check route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in email-check route.',
      });
    }
  }
  public static async PasswordGeneratorHey(req: Request, res: Response) {
    try {
      await LoginService.passwordGen(req, res);
    } catch (error: any) {
      console.error('Error in login route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in login route.',
      });
    }
  }
  public static async Login(req: Request, res: Response) {
    try {
      await LoginService.login(req, res);
    } catch (error: any) {
      console.error('Error in login route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in login route.',
      });
    }
  }

  public static async LogOut(req: Request, res: Response) {
    try {
      await LoginService.logout(req, res);
    } catch (error: any) {
      console.error('Error in LogOut route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in LogOut route.',
      });
    }
  }
}
