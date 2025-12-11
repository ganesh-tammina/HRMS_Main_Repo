import { pool } from "../config/database";
import { ConsultantTimesheet } from "./interface/interface";

export class ConsultantTimesheetService {

    static async createTimesheet(data: ConsultantTimesheet) {
        const [result]: any = await pool.query(
            "INSERT INTO consultant_timesheet SET ?",
            [data]
        );
        return result.insertId;
    }

    static async getAllTimesheets() {
        const [rows] = await pool.query("SELECT * FROM consultant_timesheet");
        return rows;
    }

    static async getTimesheetById(id: number) {
        const [rows]: any = await pool.query(
            "SELECT * FROM consultant_timesheet WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    static async updateTimesheet(id: number, data: ConsultantTimesheet) {
        await pool.query(
            "UPDATE consultant_timesheet SET ? WHERE id = ?",
            [data, id]
        );
        return true;
    }

    static async deleteTimesheet(id: number) {
        await pool.query("DELETE FROM consultant_timesheet WHERE id = ?", [id]);
        return true;
    }
}
