import { pool } from '../config/database';
import { Request, Response } from 'express';
import { RemoteClockIn } from '../interface/remote-clockin-interface';


export class RemoteClockInService {
    public static async createRemoteClockInRequest(data: RemoteClockIn) {
        const [result]: any = await pool.query(
            `INSERT INTO remote_clock_in (employee_id, date, reason, clock_in, clock_out, notify, status) 
            values (?, ?, ?, ?, ?, ?, ?)`,
            [data.employee_id, data.date, data.reason, data.clock_in, data.clock_out || null, JSON.stringify(data.notify), data.status || 'PENDING']
        );
        return result;
    }

    public static async getAllRemoteClockInRequests() {
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in ORDER BY id DESC`
        );
        return rows;
    }

    public static async getRemoteClockInRequestById(id: number) {
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
    public static async getRemoteClockInRequestsByDate(date: string) {
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in WHERE date = ? ORDER BY id DESC`,
            [date]
        );
        return rows;
    }
    public static async getRemoteClockInRequestsByStatus(status: string) {
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in WHERE status = ? ORDER BY id DESC`,
            [status]
        );
        return rows;
    }
    public static async getRemoteClockInRequestsByManager(notify: string[]) {
        const conditions = notify.map(() => 'JSON_CONTAINS(notify, ?)').join(' OR ');
        const params = notify.map(email => JSON.stringify(email));
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in WHERE ${conditions} ORDER BY id DESC`,
            params
        );
        return rows;
    }

    public static async getRemoteClockInRequests(employee_id: number) {
        const [rows] : any = await pool.query(
            `SELECT * FROM remote_clock_in WHERE employee_id = ? ORDER BY id DESC`, 
            [employee_id]
        );
        return rows;
    }   

    public static async updateRemoteClockInRequest(id: number, data: RemoteClockIn) {
        const [result]: any = await pool.query(
            `UPDATE remote_clock_in
            SET date = ?, reason = ?, clock_in = ?, notify = ?
            WHERE id = ?`,
            [data.date, data.reason, data.clock_in, data.notify, id]
        );
        return result;
    }

    public static async updateRemoteClockInRequestStatus(id: number, status: string) {
        const [result]: any = await pool.query(
            `UPDATE remote_clock_in
            SET status = ?
            WHERE id = ?`,
            [status, id]
        );
        return result;
    }
    public static async updateRemoteClockInRequestClockOut(id: number, clock_out: string) {
        const [result]: any = await pool.query(
            `UPDATE remote_clock_in
            SET clock_out = ?
            WHERE id = ?`,
            [clock_out, id]
        );
        return result;
    }
    public static async updateRemoteClockInRequestNotify(id: number, notify: string[]) {
        const [result]: any = await pool.query(
            `UPDATE remote_clock_in
            SET notify = ?
            WHERE id = ?`,
            [notify, id]
        );
        return result;
    }
    
    public static async deleteRemoteClockInRequest(id: number) {
        const [result]: any = await pool.query(
            `DELETE FROM remote_clock_in WHERE id = ?`,
            [id]
        );
        return result;
    }
}