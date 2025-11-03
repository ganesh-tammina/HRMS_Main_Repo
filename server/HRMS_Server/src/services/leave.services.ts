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

    const [row]: any = await pool.query("SELECT * FROM hrms_master_data.leave_balance where employee_id = ?", [employee_id])

    const [leaveRequest]: any = await pool.query("SELECT * FROM hrms_master_data.leave_requests where employee_id = ?", [employee_id])



    return { leaveBalance: row[0], leaveRequest: leaveRequest }
  }


  public static async getLeaveRequestID(employee_id: any) {


    // console.log(row)
    // return row
  }
  //   public static async addLeaves(data: LeaveBalance) {

  //   console.log('Received leave data:', data);

  //   const [rows] = await pool.query(
  //     `INSERT IGNORE INTO leaves (
  //       employee_id, employee_number, full_name, leave_year_start, leave_year_end,
  //       casual_leave_allocated, marriage_leave_allocated,
  //       comp_offs_allocated, sick_leave_allocated,
  //       paid_leave_allocated
  //     ) 
  //     SELECT e.employee_id, e.employee_number, e.full_name, ?, ?, ?, ?, ?, ?, ?
  //     FROM employees e`,
  //     [
  //       data.leave_year_start,
  //       data.leave_year_end,
  //       data.casual_leave_allocated ,
  //       data.marriage_leave_allocated ,
  //       data.comp_offs_allocated ,
  //       data.sick_leave_allocated ,
  //       data.paid_leave_allocated 
  //     ]
  //   );
  //   return rows;
  // }

  // public static async getLeavesByEmployeeId(employeeId: number) {
  //   const [rows] = await pool.query(
  //     `
  //     SELECT 
  //       lr.employee_id,
  //       lr.leave_type,
  //       DATE_FORMAT(lr.start_date, '%Y-%m-%d') AS start_date,
  //       DATE_FORMAT(lr.end_date, '%Y-%m-%d') AS end_date,
  //       DATEDIFF(lr.end_date, lr.start_date) + 1 AS total_days,
  //       lr.remarks,
  //       lr.status,
  //       DATE_FORMAT(lr.created_at, '%Y-%m-%d') AS submitted_on,

  //       -- Include balance info from leaves table
  //       l.casual_leave_allocated,
  //       l.casual_leave_taken,
  //       l.sick_leave_allocated,
  //       l.sick_leave_taken,
  //       l.paid_leave_allocated,
  //       l.paid_leave_taken,
  //       l.marriage_leave_allocated,
  //       l.marriage_leave_taken,
  //       l.comp_offs_allocated,
  //       l.comp_offs_taken

  //     FROM leave_requests lr
  //     LEFT JOIN leaves l 
  //       ON lr.employee_id = l.employee_id
  //     WHERE lr.employee_id = ?
  //     ORDER BY lr.created_at DESC
  //     `,
  //     [employeeId]
  //   );

  //   return rows;
  // }


}
