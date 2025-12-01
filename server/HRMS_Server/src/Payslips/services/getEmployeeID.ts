import { pool } from '../../config/database';
async function getEmployeeId(employee_number: string): Promise<number | null> {
    const [rows]: any = await pool.query(
        "SELECT id FROM employees WHERE employee_id = ?",
        [employee_number]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0].id;
}