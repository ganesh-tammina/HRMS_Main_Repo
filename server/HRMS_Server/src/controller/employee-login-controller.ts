import LoginService from "../services/employee-login-service";
import { Request, Response } from "express";
export default class EmployeeLoginController {
    public static async EmailCheck(req: Request, res: Response) {
        try {
            const loginService = new LoginService();
            await loginService.emailCheck(req, res);
        } catch (error: any) {
            console.error("Error in email-check route:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error in email-check route.",
            });
        }
    }
}