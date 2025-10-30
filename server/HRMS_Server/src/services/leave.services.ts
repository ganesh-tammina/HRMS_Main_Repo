import { pool } from '../config/database';
import { LeaveBalance, LeaveRequest } from '../interface/leave-interface';
export default class LeaveService {
  public static async createLeaveBalance(data: LeaveBalance) {
    const [rows] = await pool.query(
      `INSERT INTO leave_balance (employee_id, leave_year_start, leave_year_end, casual_leave_allocated, marriage_leave_allocated, comp_offs_allocated, sick_leave_allocated, paid_leave_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.leave_year_start,
        data.leave_year_end,
        data.casual_leave_allocated || 0,
        data.marriage_leave_allocated || 0,
        data.comp_offs_allocated || 0,
        data.sick_leave_allocated || 0,
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

  public static async addLeaves(data: LeaveBalance) {

  console.log('Received leave data:', data);

  const [rows] = await pool.query(
    `INSERT IGNORE INTO leaves (
      employee_id, employee_number, full_name, leave_year_start, leave_year_end,
      casual_leave_allocated, marriage_leave_allocated,
      comp_offs_allocated, sick_leave_allocated,
      paid_leave_allocated
    ) 
    SELECT e.employee_id, e.employee_number, e.full_name, ?, ?, ?, ?, ?, ?, ?
    FROM employees e`,
    [
      data.leave_year_start,
      data.leave_year_end,
      data.casual_leave_allocated ,
      data.marriage_leave_allocated ,
      data.comp_offs_allocated ,
      data.sick_leave_allocated ,
      data.paid_leave_allocated 
    ]
  );
  return rows;
}

  public static async getLeavesByEmployeeId(employeeId: number) {
    const [rows] = await pool.query(
      'SELECT * FROM leaves WHERE employee_id = ?',
      [employeeId]
    );
    return rows;
  }

}
