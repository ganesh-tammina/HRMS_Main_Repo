import { pool } from '../config/database';
import { WorkFromHome } from '../interface/work-from-home.interface';

export class WFHService {
    public static async applyWorkFromHome(data: WorkFromHome) {
      console.log("SERVICE DATA =>", data);
        let notifyEmployeeId = (data as any).notify_id;
        let notify_id = null;

        if (!notifyEmployeeId) {
            const [managerResult]: any = await pool.query(
                `SELECT e.employee_id as manager_id
                FROM employees e
                JOIN employment_details ed 
                ON e.employee_number = ed.reporting_manager_employee_number
                WHERE ed.employee_id = ?;`,
                [data.employee_id]
            );
            notifyEmployeeId = managerResult[0]?.manager_id;
        }

    if (notifyEmployeeId) {
      const [notifyResult]: any = await pool.query(
        `INSERT INTO notified_user (employee_id) VALUES (?)`,
        [notifyEmployeeId]
      );
      notify_id = notifyResult.insertId;
    }

    const [result]: any = await pool.query(
      `INSERT INTO work_from_home 
     (employee_id, from_date, from_session, to_date, to_session, reason, type, total_days, notify_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.from_date,
        data.from_session || 'Full Day',
        data.to_date,
        data.to_session || 'Full Day',
        data.reason,
        data.type || 'WFH',
        data.total_days,
        notify_id
      ]
    );

    return { success: true, inserted_id: result.insertId };
  }
}