import { AttendanceEventInput, AttendanceRecordInput, DailyAccumulationInput, TO, TT } from '../interface/attendance-interface';
export default class AttendanceService {
    static countLogin(data: TT): Promise<{
        number: number;
        status: boolean;
    }>;
    static clockIn(data: TT): Promise<import("mysql2").QueryResult>;
    static clockOut(data: TO): Promise<{
        status: boolean;
        message: string;
        check_out?: never;
        attendance_id?: never;
        date?: never;
    } | {
        status: boolean;
        message: string;
        check_out: string;
        attendance_id: any;
        date: Date;
    }>;
    static getAttendance(data: any): Promise<import("mysql2").QueryResult>;
    static notinyet(): Promise<any>;
    static upsertAttendanceRecord(data: AttendanceRecordInput): Promise<{
        message: string;
        recordId: any;
    }>;
    static addAttendanceEvent(data: AttendanceEventInput): Promise<{
        message: string;
        eventId: any;
    }>;
    static upsertDailyAccumulation(data: DailyAccumulationInput): Promise<{
        message: string;
    }>;
    static getEmployeeAttendance(employeeId: number): Promise<any>;
    static getTodayAttendance(asdfads: number): Promise<any>;
    static getTodayAttendanceExtra(emp_id: string, asdfads: string): Promise<any>;
    static qeiwoi(asdads: number): Promise<{
        shift_policy_name: string;
    }>;
    static qeiwoasi(asdads: string): Promise<{
        check_in: string;
        check_out: string;
    }>;
}
//# sourceMappingURL=attendance-service.d.ts.map