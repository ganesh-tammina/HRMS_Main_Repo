import { Request, Response } from 'express';
export default class LeaveController {
    static createLeaveBalance(req: Request, res: Response): Promise<void>;
    static createLeaveRequest(req: Request, res: Response): Promise<void>;
    static getLeaveBalances(_req: Request, res: Response): Promise<void>;
    static getLeaveRequests(_req: Request, res: Response): Promise<void>;
    static addLeaves(req: Request, res: Response): Promise<void>;
    static getLeaves(req: Request, res: Response): Promise<void>;
    static getLeaveRequest(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=leave.controller.d.ts.map