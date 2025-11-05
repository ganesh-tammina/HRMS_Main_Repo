import { pool } from '../config/database';
import { LeaveBalance, LeaveRequest } from '../interface/leave-interface';
export default class LeaveService {
  public static async createLeaveBalance(data: LeaveBalance) {
    const [rows] = await pool.query(
      `INSERT INTO leave_balance (employee_id, leave_year_start, leave_year_end, casual_leave_allocated, marriage_leave_allocated, comp_offs_allocated, medical_leave_allocated, unpaid_leave_allocated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.leave_year_start,
        data.leave_year_end,
        data.casual_leave_allocated || 0,
        data.marriage_leave_allocated || 0,
        data.comp_offs_allocated || 0,
        data.medical_leave_allocated || 0,
        data.unpaid_leave_allocated || 0,
      ]
    );
    return rows;
  }

  public static async createLeaveRequest(data: LeaveRequest) {
    console.log('Creating leave request with data:', data);
    const [rows] = await pool.query(
      `INSERT INTO leave_requests (employee_id,leave_type, start_date, end_date, total_days, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
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

  public static async getLeaveBalance(employee_id: any) {
    const [row]: any = await pool.query(
      'SELECT * FROM hrms_master_data.leave_balance where employee_id = ?',
      [employee_id]
    );

    const [leaveRequest]: any = await pool.query(
      'SELECT * FROM hrms_master_data.leave_requests where employee_id = ?',
      [employee_id]
    );

    return { leaveBalance: row[0], leaveRequest: leaveRequest };
  }

  public static async getLeaveRequestById(employee_id: any) {
    const [row]: any = await pool.query(
      'SELECT * FROM hrms_master_data.leave_requests where employee_id = ?',
      [employee_id]
    );

    return row;
  }

  public static async addLeaves(data: LeaveBalance) {
    try {
      const [rows]: any = await pool.query(
        'SELECT employee_id FROM employees;'
      );

      const emp_ID: LeaveBalance[] = rows.map((t: any) => ({
        employee_id: t.employee_id,
        leave_year_start: data.leave_year_start,
        leave_year_end: data.leave_year_end,
        casual_leave_allocated: data.casual_leave_allocated || 0,
        marriage_leave_allocated: data.marriage_leave_allocated || 0,
        comp_offs_allocated: data.comp_offs_allocated || 0,
        medical_leave_allocated: data.medical_leave_allocated || 0,
        unpaid_leave_allocated: data.unpaid_leave_allocated || 0,
      }));

      const [existing]: any = await pool.query(
        `SELECT employee_id FROM leave_balance WHERE leave_year_start = ? AND leave_year_end = ?`,
        [data.leave_year_start, data.leave_year_end]
      );

      const existingIds = new Set(existing.map((e: any) => e.employee_id));

      const filteredEmployees = emp_ID.filter(
        (emp) => !existingIds.has(emp.employee_id)
      );

      if (filteredEmployees.length === 0) {
        return {
          message:
            'All employees already have leave balances for this year range.',
        };
      }

      const values = filteredEmployees.map((emp) => [
        emp.employee_id,
        emp.leave_year_start,
        emp.leave_year_end,
        emp.casual_leave_allocated,
        emp.marriage_leave_allocated,
        emp.comp_offs_allocated,
        emp.medical_leave_allocated,
        emp.unpaid_leave_allocated,
      ]);

      const query = `
      INSERT INTO leave_balance 
      (employee_id, leave_year_start, leave_year_end, casual_leave_allocated, marriage_leave_allocated, comp_offs_allocated, medical_leave_allocated, unpaid_leave_allocated)
      VALUES ?
    `;

      const [result]: any = await pool.query(query, [values]);

      return {
        message: 'Leave balances created successfully for eligible employees.',
        insertedCount: filteredEmployees.length,
        skippedCount: existingIds.size,
        result,
      };
    } catch (error) {
      console.error('Error creating leave balances:', error);
      throw new Error('Failed to create leave balances.');
    }
  }

  public static async takeActionLeaveRequest(
    leave_req_id: number,
    action_by_emp_id: number,
  ) {
    const connection = pool.getConnection();
    (await connection).beginTransaction();
    const [rows] = await pool.query(
      `INSERT INTO hrms_master_data.leave_action(leave_req_id, action_by_emp_id) VALUES(?, ?)`,
      [leave_req_id, action_by_emp_id]
    );
  }
}
