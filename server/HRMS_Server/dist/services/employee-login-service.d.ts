import { Request, Response } from 'express';
export default class LoginService {
    private static emailSchema;
    private static passwordChangeSchema;
    private static loginSchema;
    static emailCheck(req: Request, res: Response): Promise<void>;
    static passwordGen(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    private static cookieSetter;
    static invalidateExpiredTokens(): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static refreshToken(req: Request, res: Response): Promise<any>;
    private static jwtAuth;
    private static otpUtil;
    static resetTokens(employee_id: number): Promise<{
        success: boolean;
        deleted?: number;
        message?: string;
        error?: string;
    }>;
    static isTokenActive(token: string): Promise<boolean>;
    static getEmployeeRoles(employee_id: number): Promise<{
        status: string;
        message: string;
        data?: never;
    } | {
        status: string;
        data: any;
        message?: never;
    }>;
    static forgotPwd(req: Request, res: Response): Promise<void>;
    static changePwd(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=employee-login-service.d.ts.map