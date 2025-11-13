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
  public static async ForgotEmailCheck(req: Request, res: Response) {
    try {
      await LoginService.emailCheckForForgot(req, res);
    } catch (error: any) {
      console.error('Error in email-check route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in email-check route.',
      });
    }
  }
  public static async forgot(req: Request, res: Response) {
    try {
      await LoginService.forgotpassword(req, res);
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

  public static async getRole(req: Request, res: Response) {
    if (!req.body?.employee_id) {
      return res.status(400).json({
        success: false,
      });
    }
    try {
      const tiger = await LoginService.getEmployeeRoles(req.body.employee_id);
      if (tiger.status === 'success') {
        return res.status(200).json(tiger);
      } else {
        return res.status(400).json(tiger);
      }
    } catch (error: any) {
      console.error('Error in LogOut route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in LogOut route.',
      });
    }
  }

  public static async ForgotPwd(req: Request, res: Response) {
    try {
      await LoginService.forgotPwd(req, res);
    } catch (error: any) {
      console.error('Error in ForgotPwd route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in ForgotPwd route.',
      });
    }
  }

  public static async ChangePwd(req: Request, res: Response) {
    try {
      await LoginService.changePwd(req, res);
    } catch (error: any) {
      console.error('Error in ChangePwd route:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in ChangePwd route.',
      });
    }
  }
}
