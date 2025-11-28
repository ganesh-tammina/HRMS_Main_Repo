
import { pool } from '../config/database';
import { Request, Response } from 'express';
import { WorkFromHome } from '../interface/work-from-home.interface';

export class WorkFromHomeService {
    public static async applyWorkFromHome(data: WorkFromHome) {
        const [result] : any = await pool.query(
            `insert into work_from_home (employee_id, from_date, to_date, reason, total_days, notify)
            values (?,?,?,?,?,?)`,
            [
                data.employee_id,
                data.from_date,
                data.to_date,
                data.reason,
                data.total_days,
                data.notify
            ]
        )
        return result;
    }

    public static async getWFHRequestsByEmployeeId(employee_id: number) {
        const [rows] : any =  await pool.query(
            `select * from work_from_home where employee_id = ?`,
            [employee_id]
        );
        return rows;
    }

    public static async getAllWFHRequests() {
        const [rows] : any =  await pool.query(
            `select * from work_from_home`
        );
        return rows;
    }

    public static async updateWFHRequestStatus(request_id: number, status: string) {
        const [result] : any = await pool.query(
            `update work_from_home set status = ? where id = ?`,
            [status, request_id]
        );
        return result;
    }

    public static async deleteWFHRequest(request_id: number) {
        const [result] : any = await pool.query(
            `delete from work_from_home where id = ?`,
            [request_id]
        );
        return result;
    }
}

