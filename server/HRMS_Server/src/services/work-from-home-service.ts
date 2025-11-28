import { pool } from '../config/database';
import { WorkFromHome } from '../interface/work-from-home.interface';

export class WorkFromHomeService {
  static async getMyNotified(myId: string) {
    const [adfasd]: any = await pool.query(
      'select w.* from work_from_home w join notified_user n ON w.notify_id = n.notify_id where n.employee_id = ?',
      [myId]
    )
    return adfasd;
  }
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
      `SELECT 
    w.id,
    w.employee_id AS employee_id_applied,
    k.full_name AS applied_user_name,
    n.employee_id AS employeee_id_notified,
    e.full_name AS notified_user_name,
    w.reason,
    w.from_date,
    w.to_date,
    w.total_days,
    w.type,
    n.action_taken
    FROM
    work_from_home w
        LEFT JOIN
    notified_user n ON w.notify_id = n.notify_id
        LEFT JOIN
    employees e ON n.employee_id = e.employee_id
        LEFT JOIN
    employees k ON k.employee_id = w.employee_id where w.employee_id = ? and n.action_taken = 'pending'`,
      [employee_id]
    );
    return rows.length > 0 ? rows : 'No Request Found';
  }

  public static async getAllWFHRequests() {
    const [rows]: any = await pool.query(
      `SELECT  
    w.id,
    w.employee_id AS employee_id_applied,
    k.full_name AS applied_user_name,
    n.employee_id AS employeee_id_notified,
    e.full_name AS notified_user_name,
    w.reason,
    w.from_date,
    w.to_date,
    w.total_days,
    w.type,
    n.action_taken
    FROM
    work_from_home w
        LEFT JOIN
    notified_user n ON w.notify_id = n.notify_id
        LEFT JOIN
    employees e ON n.employee_id = e.employee_id
        LEFT JOIN
    employees k ON k.employee_id = w.employee_id`
    );
    return rows;
  }

  public static async updateWFHRequestStatus(
    notifier_id: number,
    request_id: number,
    status: string
  ) {
    if (status === 'approved' || status === 'cancelled') {
      return 'Invalid status type.';
    }
    const [wfh]: any = await pool.query(
      'select w.notify_id, n.employee_id as notified_user from work_from_home w join notified_user n on w.notify_id = n.notify_id where w.id = ?',
      [request_id]
    );
    if (wfh.length === 0) {
      return 'No Data Found. Invalid request';
    }
    if (wfh[0].notified_user != notifier_id) {
      return 'You are not authorized to perform this action.';
    }
    const [result]: any = await pool.query(
      `UPDATE notified_user SET status = ? WHERE id = ?`,
      [status, wfh[0].notify_id]
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
