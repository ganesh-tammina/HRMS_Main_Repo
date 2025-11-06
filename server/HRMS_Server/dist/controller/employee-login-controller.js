"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employee_login_service_1 = __importDefault(require("../services/employee-login-service"));
class EmployeeLoginController {
    static async EmailCheck(req, res) {
        try {
            await employee_login_service_1.default.emailCheck(req, res);
        }
        catch (error) {
            console.error('Error in email-check route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in email-check route.',
            });
        }
    }
    static async PasswordGeneratorHey(req, res) {
        try {
            await employee_login_service_1.default.passwordGen(req, res);
        }
        catch (error) {
            console.error('Error in login route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in login route.',
            });
        }
    }
    static async Login(req, res) {
        try {
            await employee_login_service_1.default.login(req, res);
        }
        catch (error) {
            console.error('Error in login route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in login route.',
            });
        }
    }
    static async LogOut(req, res) {
        try {
            await employee_login_service_1.default.logout(req, res);
        }
        catch (error) {
            console.error('Error in LogOut route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in LogOut route.',
            });
        }
    }
    static async getRole(req, res) {
        if (!req.body?.employee_id) {
            return res.status(400).json({
                success: false,
            });
        }
        try {
            const tiger = await employee_login_service_1.default.getEmployeeRoles(req.body.employee_id);
            if (tiger.status === 'success') {
                return res.status(200).json(tiger);
            }
            else {
                return res.status(400).json(tiger);
            }
        }
        catch (error) {
            console.error('Error in LogOut route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in LogOut route.',
            });
        }
    }
    static async ForgotPwd(req, res) {
        try {
            await employee_login_service_1.default.forgotPwd(req, res);
        }
        catch (error) {
            console.error('Error in ForgotPwd route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in ForgotPwd route.',
            });
        }
    }
    static async ChangePwd(req, res) {
        try {
            await employee_login_service_1.default.changePwd(req, res);
        }
        catch (error) {
            console.error('Error in ChangePwd route:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error in ChangePwd route.',
            });
        }
    }
}
exports.default = EmployeeLoginController;
//# sourceMappingURL=employee-login-controller.js.map