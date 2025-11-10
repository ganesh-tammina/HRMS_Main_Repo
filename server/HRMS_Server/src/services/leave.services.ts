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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();


    const [leaveBalanceRows] = await connection.query(
      `SELECT * FROM hrms_master_data.leave_balance WHERE employee_id = ? FOR UPDATE`,
      [data.employee_id]
    );

    const leaveBalance: any = (leaveBalanceRows as any)[0];
    if (!leaveBalance) {
      throw new Error('Leave balance not found for the employee.');
    }

    if (data.leave_type === "CASUAL" && leaveBalance.casual_leave_allocated < data.total_days) {
      throw new Error('Insufficient casual leave balance.');
    }
    if (data.leave_type === "MEDICAL" && leaveBalance.medical_leave_allocated < data.total_days) {
      throw new Error('Insufficient medical leave balance.');
    }
    if (data.leave_type === "MARRIAGE" && leaveBalance.marriage_leave_allocated < data.total_days) {
      throw new Error('Insufficient marriage leave balance.');
    }
    if (data.leave_type === "COMP_OFF" && leaveBalance.comp_offs_allocated < data.total_days) {
      throw new Error('Insufficient comp off balance.');
    }

    const [insertResult] = await connection.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.employee_id,
        data.leave_type,
        data.start_date,
        data.end_date,
        data.total_days,
        data.remarks || null,
      ]
    );

    type LeaveColumns = { allocated?: string; taken: string };
    const leaveMap: Record<string, LeaveColumns> = {
      CASUAL: { allocated: 'casual_leave_allocated', taken: 'casual_leave_taken' },
      MEDICAL: { allocated: 'medical_leave_allocated', taken: 'medical_leave_taken' },
      MARRIAGE: { allocated: 'marriage_leave_allocated', taken: 'marriage_leave_taken' },
      COMP_OFF: { allocated: 'comp_offs_allocated', taken: 'comp_offs_taken' },
      UNPAID: { taken: 'unpaid_leave_taken' }
    };

    const columns = leaveMap[data.leave_type];
    if (!columns) throw new Error('Invalid leave type.');

    if (data.leave_type === 'UNPAID') {
      await connection.query(
        `UPDATE hrms_master_data.leave_balance 
         SET ${columns.taken} = ${columns.taken} + ? 
         WHERE employee_id = ?`,
        [data.total_days, data.employee_id]
      );
    } else {
      await connection.query(
        `UPDATE hrms_master_data.leave_balance 
         SET ${columns.allocated!} = ${columns.allocated!} - ?, 
             ${columns.taken} = ${columns.taken} + ? 
         WHERE employee_id = ?`,
        [data.total_days, data.total_days, data.employee_id]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: 'Leave request created successfully.',
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating leave request:', error);
    throw error;
  } finally {
    connection.release();
  }
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

public static async cancelLeaveRequest(leaveId: number) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Lock the leave request row for update
    const [leaveRows]: any = await connection.query(
      `SELECT * FROM hrms_master_data.leave_requests WHERE id = ? FOR UPDATE`,
      [leaveId]
    );

    const leaveRequest: any = leaveRows[0];
    if (!leaveRequest) {
      throw new Error('Leave request not found.');
    }

    // Step 2: Define mapping between leave types and DB columns
    type LeaveColumns = { allocated?: string; taken: string };
    const leaveMap: Record<string, LeaveColumns> = {
      CASUAL: { allocated: 'casual_leave_allocated', taken: 'casual_leave_taken' },
      MEDICAL: { allocated: 'medical_leave_allocated', taken: 'medical_leave_taken' },
      MARRIAGE: { allocated: 'marriage_leave_allocated', taken: 'marriage_leave_taken' },
      COMP_OFF: { allocated: 'comp_offs_allocated', taken: 'comp_offs_taken' },
      UNPAID: { taken: 'unpaid_leave_taken' }
    };

    const columns = leaveMap[leaveRequest.leave_type];
    if (!columns) throw new Error('Invalid leave type.');

    // Step 3: Update leave balance
    let balanceUpdateResult: any;

    if (leaveRequest.leave_type === 'UNPAID') {
      [balanceUpdateResult] = await connection.query(
        `UPDATE hrms_master_data.leave_balance
         SET ${columns.taken} = ${columns.taken} - ?
         WHERE employee_id = ?`,
        [leaveRequest.total_days, leaveRequest.employee_id]
      );
    } else {
      [balanceUpdateResult] = await connection.query(
        `UPDATE hrms_master_data.leave_balance
         SET ${columns.allocated!} = ${columns.allocated!} + ?,
             ${columns.taken} = ${columns.taken} - ?
         WHERE employee_id = ?`,
        [leaveRequest.total_days, leaveRequest.total_days, leaveRequest.employee_id]
      );
    }

    // ✅ Verify Step 3 succeeded before proceeding
    if (balanceUpdateResult.affectedRows === 0) {
      throw new Error('Failed to update leave balance. Cancellation aborted.');
    }

    // Step 4: Safely update leave request status only if not already cancelled/rejected
    const [updateResult]: any = await connection.query(
      `UPDATE hrms_master_data.leave_requests
       SET status = 'CANCELLED'
       WHERE id = ? AND status NOT IN ('CANCELLED', 'REJECTED')`,
      [leaveId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('Leave request cannot be cancelled. It may already be cancelled or rejected.');
    }

    // Step 5: Commit transaction
    await connection.commit();

    return {
      success: true,
      message: 'Leave request cancelled successfully.',
    };

  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling leave request:', error);
    throw error;
  } finally {
    connection.release();
  }
}

}
