import { pool } from '../config/database';
import { LeaveBalance, LeaveRequest } from '../interface/leave-interface';
export default class LeaveService {
  public static async createLeaveBalance(data: LeaveBalance) {
    const [rows] = await pool.query(
      `INSERT INTO leave_balance (employee_id, leave_year_start, leave_year_end, casual_leave_allocated, marriage_leave_allocated, comp_offs_allocated, medical_leave_allocated, paid_leave_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.leave_year_start,
        data.leave_year_end,
        data.casual_leave_allocated || 0,
        data.marriage_leave_allocated || 0,
        data.comp_offs_allocated || 0,
        data.medical_leave_allocated || 0,
        data.paid_leave_allocated || 0,
      ]
    );
    return rows;
  }

  public static async createLeaveRequest(data: LeaveRequest) {
    const [rows] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.leave_type,
        data.start_date,
        data.end_date,
        data.total_days,
        data.remarks || null,
      ]
    );
    return rows;
  }
  public static async getLeaveBalances() {
    const [rows] = await pool.query('SELECT * FROM leave_balance');
    return rows;
  }
  public static async getLeaveRequests() {
    const [rows] = await pool.query('SELECT * FROM leave_requests');
    return rows;
  }
}
