import { Request, Response } from 'express';
export default class AttendanceController {
    static handleClockIn(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static handleClockOut(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAttendance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static notinyet(req: Request, res: Response): Promise<void>;
    static upsertAttendanceRecord(req: Request, res: Response): Promise<void>;
    static addAttendanceEvent(req: Request, res: Response): Promise<void>;
    static upsertDailyAccumulation(req: Request, res: Response): Promise<void>;
    static getEmployeeAttendance(req: Request, res: Response): Promise<void>;
    static llakdjlfjas(reeq: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static kasdja(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static diff(time1: string, time2: string): string;
}
//# sourceMappingURL=attendance-controller.d.ts.map