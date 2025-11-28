import { ResultSetHeader } from "mysql2";
import { pool } from "../../config/database";
import { Holiday } from "../interface/holidays.interface";

export class HolidayService {

    // ✅ Bulk insert
    static async bulkInsert(holidays: Holiday[]): Promise<number> {
        if (!holidays.length) return 0;

        const values = holidays.map(h => [
            h.holiday_date,
            h.holiday_name,
            h.day_name,
            h.description || ''
        ]);

        const query = `
            INSERT INTO holidays 
            (holiday_date, holiday_name, day_name, description)
            VALUES ?
        `;

        const [result] = await pool.query<ResultSetHeader>(query, [values]);
        return result.affectedRows;
    }

    // ✅ Get all holidays
    static async getAll(): Promise<Holiday[]> {
        const query = `SELECT * FROM holidays ORDER BY holiday_date ASC`;
        const [rows] = await pool.query(query);
        return rows as Holiday[];
    }

    // ✅ Delete by ID
    static async deleteById(id: number): Promise<void> {
        const query = `DELETE FROM holidays WHERE id = ?`;
        await pool.query(query, [id]);
    }
}
