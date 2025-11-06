import { Request, Response } from 'express';
export default class EmployeeLoginController {
    static EmailCheck(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static PasswordGeneratorHey(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static Login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static LogOut(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static ForgotPwd(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static ChangePwd(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=employee-login-controller.d.ts.map