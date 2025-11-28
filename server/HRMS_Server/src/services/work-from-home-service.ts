import { pool } from '../config/database';
import { WorkFromHome } from '../interface/work-from-home.interface';

export class WorkFromHomeService {
  public static async applyWorkFromHome(data: WorkFromHome) {
    const [notifyResult]: any = await pool.query(
      `INSERT INTO notified_user (employee_id) VALUES (?)`,
      [data.notified_user_id]
    );

    const notify_id = notifyResult.insertId;

    const [result]: any = await pool.query(
      `INSERT INTO work_from_home 
        (employee_id, from_date, from_session, to_date, to_session, reason, type, total_days, notify_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.from_date,
        data.from_session,
        data.to_date,
        data.to_session,
        data.reason,
        data.type,
        data.total_days,
        notify_id,
      ]
    );

    return { success: true, inserted_id: result.insertId };
  }

  public static async getWFHRequestsByEmployeeId(employee_id: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM work_from_home WHERE employee_id = ?`,
      [employee_id]
    );
    return rows;
  }

  public static async getAllWFHRequests() {
    const [rows]: any = await pool.query(
      `SELECT 
          w.*, n.action_taken 
       FROM work_from_home w
       LEFT JOIN notified_user n 
            ON w.notify_id = n.notify_id`
    );
    return rows;
  }

  public static async updateWFHRequestStatus(
    request_id: number,
    status: string
  ) {
    const [result]: any = await pool.query(
      `UPDATE work_from_home SET status = ? WHERE id = ?`,
      [status, request_id]
    );
    return result;
  }

  public static async deleteWFHRequest(request_id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM work_from_home WHERE id = ?`,
      [request_id]
    );
    return result;
  }
}
