import { LeaveBalance, LeaveRequest } from '../interface/leave-interface';
export default class LeaveService {
    static createLeaveBalance(data: LeaveBalance): Promise<import("mysql2").QueryResult>;
    static createLeaveRequest(data: LeaveRequest): Promise<import("mysql2").QueryResult>;
    static getLeaveBalances(): Promise<import("mysql2").QueryResult>;
    static getLeaveRequests(): Promise<import("mysql2").QueryResult>;
    static getLeaveBalance(employee_id: any): Promise<{
        leaveBalance: any;
        leaveRequest: any;
    }>;
    static getLeaveRequestID(employee_id: any): Promise<void>;
    static addLeaves(data: LeaveBalance): Promise<{
        message: string;
        insertedCount?: never;
        skippedCount?: never;
        result?: never;
    } | {
        message: string;
        insertedCount: number;
        skippedCount: number;
        result: any;
    }>;
    static takeActionLeaveRequest(leave_req_id: number, action_by_emp_id: number): Promise<void>;
}
//# sourceMappingURL=leave.services.d.ts.map