import { pool } from '../config/database';
import {
  AttendanceEventInput,
  AttendanceRecordInput,
  DailyAccumulationInput,
  TO,
  TT,
} from '../interface/attendance-interface';

export default class AttendanceService {
  public static async countLogin(data: TT) {
    let [myworkistogetdata]: any = [];
    const count = {
      number: 0,
      status: true,
    };
    try {
      [myworkistogetdata] = await pool.query(
        'Select count(*) as counter from attendance where employee_id = ? and attendance_date = curdate()',
        [data.employee_id]
      );
      if (myworkistogetdata[0].counter > 0) {
        throw new Error();
      } else {
        return count;
      }
    } catch (e) {
      count.number = myworkistogetdata[0].counter;
      count.status = false;
      console.log(count);
      return count;
    }
  }
  public static async clockIn(data: TT) {
    try {
      const query = `
        INSERT INTO attendance (employee_id, attendance_date, check_in)
        VALUES (?, CURDATE(), ?)
      `;
      const [result] = await pool.query(query, [
        data.employee_id,
        data.check_in,
      ]);

      return result;
    } catch (err) {
      throw err;
    }
  }
  public static async clockOut(data: TO) {
    try {
      const [openRecords]: any = await pool.query(
        `SELECT attendance_id as id FROM attendance 
       WHERE attendance_date = CURDATE()
         AND employee_id = ?
         AND check_out IS NULL
       ORDER BY check_in DESC
       LIMIT 1`,
        [data.employee_id]
      );

      if (openRecords.length === 0) {
        return { status: false, message: 'You are not clocked in today' };
      }

      const attendanceId = openRecords[0].id;

      const [result]: any = await pool.query(
        `UPDATE attendance 
       SET check_out = ? 
       WHERE attendance_id = ?`,
        [data.check_out, attendanceId]
      );

      if (result.affectedRows === 0) {
        return { status: false, message: 'Failed to update check-out time' };
      }

      return {
        status: true,
        message: 'Clocked out successfully',
        check_out: data.check_out,
        attendance_id: attendanceId,
        date: new Date(),
      };
    } catch (err) {
      console.error('Error in clockOut:', err);
      throw err;
    }
  }

  public static async getAttendance(data: any) {
    try {
      let query = `
        SELECT a1.attendance_id, a1.employee_id, a1.attendance_date, a1.check_in, a1.check_out,
        (
          SELECT MIN(a2.check_in) 
          FROM attendance a2 
          WHERE a2.employee_id = a1.employee_id 
          AND a2.attendance_date = a1.attendance_date
        ) as first_check_in_of_day,
        CASE 
          WHEN (
            SELECT MIN(a2.check_in) 
            FROM attendance a2 
            WHERE a2.employee_id = a1.employee_id 
            AND a2.attendance_date = a1.attendance_date
          ) <= '09:30:00' THEN 'On Time'
          ELSE CONCAT(
            DATE_FORMAT(
              TIMEDIFF(
                (SELECT MIN(a2.check_in) FROM attendance a2 WHERE a2.employee_id = a1.employee_id AND a2.attendance_date = a1.attendance_date),
                '09:30:00'
              ), '%H:%i:%s'
            ), ' late'
          )
        END as arrival_time
        FROM attendance a1 WHERE a1.employee_id = ?`;
      const params: any[] = [data.employee_id];
      if (data.startDate && data.endDate) {
        query += ` AND a1.attendance_date BETWEEN ? AND ?`;
        params.push(data.startDate, data.endDate);
      } else if (data.date) {
        query += ` AND a1.attendance_date = ?`;
        params.push(data.date);
      }
      query += ` ORDER BY a1.attendance_date DESC, a1.check_in ASC`;

      const [result] = await pool.query(query, params);
      return result;
    } catch (err) {
      throw err;
    }
  }
  public static async notinyet() {
    const [all_Candidates]: any = await pool.query(
      "select id from candidates where status = 'accepted'"
    );
    const [in_candidates]: any = await pool.query(
      'select employee_id from attendance where attendance_date = curdate()'
    );
    const inCandidateIds = new Set(
      in_candidates.map((c: any) => c.employee_id)
    );

    const notCheckedIn = all_Candidates.filter(
      (candidate: any) => !inCandidateIds.has(candidate.id)
    );
    return notCheckedIn;
  }
  public static async upsertAttendanceRecord(data: AttendanceRecordInput) {
    const { employeeId, clockInTime, accumulatedMs, isClockedIn } = data;

    const [existing] = await pool.query(
      `SELECT record_id FROM attendance_records WHERE employee_id = ?`,
      [employeeId]
    );

    if ((existing as any[]).length > 0) {
      const recordId = (existing as any[])[0].record_id;
      await pool.query(
        `UPDATE attendance_records 
         SET clock_in_time = ?, accumulated_ms = ?, is_clocked_in = ?, updated_at = NOW()
         WHERE record_id = ?`,
        [clockInTime, accumulatedMs, isClockedIn, recordId]
      );
      return { message: 'Attendance record updated', recordId };
    } else {
      const [result] = await pool.query(
        `INSERT INTO attendance_records (employee_id, clock_in_time, accumulated_ms, is_clocked_in)
         VALUES (?, ?, ?, ?)`,
        [employeeId, clockInTime, accumulatedMs, isClockedIn]
      );
      return {
        message: 'Attendance record created',
        recordId: (result as any).insertId,
      };
    }
  }
  public static async addAttendanceEvent(data: AttendanceEventInput) {
    const { recordId, eventType, eventTime, displayTime } = data;

    const [result] = await pool.query(
      `INSERT INTO attendance_events (record_id, event_type, event_time, display_time)
       VALUES (?, ?, ?, ?)`,
      [recordId, eventType, eventTime, displayTime]
    );

    return { message: 'Event added', eventId: (result as any).insertId };
  }
  public static async upsertDailyAccumulation(data: DailyAccumulationInput) {
    const { recordId, workDate, accumulatedMs } = data;

    await pool.query(
      `INSERT INTO attendance_daily_accumulation (record_id, work_date, accumulated_ms)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE accumulated_ms = VALUES(accumulated_ms), updated_at = NOW()`,
      [recordId, workDate, accumulatedMs]
    );

    return { message: 'Daily accumulation updated' };
  }
  public static async getEmployeeAttendance(employeeId: number) {
    const [records] = await pool.query(
      `SELECT * FROM attendance_records WHERE employee_id = ?`,
      [employeeId]
    );

    if ((records as any[]).length === 0) return null;

    const record = (records as any[])[0];

    const [events] = await pool.query(
      `SELECT * FROM attendance_events WHERE record_id = ? ORDER BY event_time ASC`,
      [record.record_id]
    );

    const [daily] = await pool.query(
      `SELECT * FROM attendance_daily_accumulation WHERE record_id = ? ORDER BY work_date ASC`,
      [record.record_id]
    );

    return {
      ...record,
      history: events,
      dailyAccumulated: daily,
    };
  }
  public static async getTodayAttendance(asdfads: number) {
    console.log('Getting today attendance for employee:', asdfads);
    const [adfasd]: any = await pool.query(
      `SELECT employee_id, attendance_date,
       MIN(check_in) as first_check_in,
       MAX(check_out) as last_check_out,
       DATE_FORMAT(MAX(check_out), '%H:%i:%s') as departure_time,
       CASE 
         WHEN MIN(check_in) <= '09:30:00' THEN 'On Time'
         ELSE CONCAT(DATE_FORMAT(TIMEDIFF(MIN(check_in), '09:30:00'), '%H:%i:%s'), ' late')
       END as arrival_time,
       CASE 
         WHEN MIN(check_in) <= '09:30:00' THEN 'on_time'
         ELSE 'late'
       END as status,
       CASE 
         WHEN MIN(check_in) > '09:30:00' THEN DATE_FORMAT(TIMEDIFF(MIN(check_in), '09:30:00'), '%H:%i:%s')
         ELSE NULL
       END as late_duration
       FROM attendance 
       WHERE employee_id = ? AND attendance_date = CURDATE()
       GROUP BY employee_id, attendance_date`,
      [asdfads]
    );

    console.log('Today attendance result:', adfasd);
    return adfasd;
  }
  public static async getTodayAttendanceExtra(emp_id: string, asdfads: string) {
    const [adfasd]: any = await pool.query(
      `SELECT attendance_id, employee_id, attendance_date,
       MIN(check_in) as first_check_in,
       MAX(check_out) as last_check_out,
       DATE_FORMAT(MAX(check_out), '%H:%i:%s') as departure_time,
       CASE 
         WHEN MIN(check_in) <= '09:30:00' THEN 'On Time'
         ELSE CONCAT(DATE_FORMAT(TIMEDIFF(MIN(check_in), '09:30:00'), '%H:%i:%s'), ' late')
       END as arrival_time,
       CASE 
         WHEN MIN(check_in) <= '09:30:00' THEN 'on_time'
         ELSE 'late'
       END as status,
       CASE 
         WHEN MIN(check_in) > '09:30:00' THEN DATE_FORMAT(TIMEDIFF(MIN(check_in), '09:30:00'), '%H:%i:%s')
         ELSE NULL
       END as late_duration
       WHERE employee_id = ? AND attendance_date = ?
       GROUP BY employee_id, attendance_date`,
      [emp_id, asdfads]
    );

    return adfasd;
  }
  public static async qeiwoi(
    asdads: number
  ): Promise<{ shift_policy_name: string }> {
    const [adfasd]: any = await pool.query(
      `SELECT shift_policy_name FROM employment_details WHERE employee_id = ?`,
      [asdads]
    );
    if (adfasd.length === 0) {
      return { shift_policy_name: 'Default' };
    }
    return adfasd[0];
  }
  public static async qeiwoasi(
    asdads: string
  ): Promise<{ check_in: string; check_out: string }> {
    const [adfasd]: any = await pool.query(
      `SELECT check_in, check_out FROM shift_policy WHERE shift_name = ?`,
      [asdads.trim()]
    );
    return { check_in: adfasd[0].check_in, check_out: adfasd[0].check_out };
  }

  public static async verifyAttendanceHistory(
    employeeId: number,
    days: number = 7
  ) {
    const [result]: any = await pool.query(
      `SELECT attendance_date, check_in, check_out, 
       DATE_FORMAT(attendance_date, '%Y-%m-%d') as formatted_date,
       DAYNAME(attendance_date) as day_name
       FROM attendance 
       WHERE employee_id = ? 
       AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY attendance_date DESC`,
      [employeeId, days]
    );
    if (result.length === 0) {
      return { success: false, message: 'No attendance data found' };
    }

    return {
      success: true,
      totalRecords: result.length,
      attendanceData: result,
      message: `Found ${result.length} attendance records`,
    };
  }

 public static async createShiftPolicyService(data: any) {
  const { shift_name, check_in, check_out } = data;

  const sql = `
    INSERT INTO shift_policy (shift_name, check_in, check_out)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      check_in = VALUES(check_in),
      check_out = VALUES(check_out)
  `;

  const params = [shift_name, check_in, check_out];

  const [result]: any = await pool.query(sql, params);

  const isUpdate = result.affectedRows === 2;

  return {
    success: true,
    isUpdate,
    shift_id: result.insertId || undefined, 
  };
}

public static async getEmployeesUnderManagerService(manager_id: number) {
  const mgrSql = `
    SELECT employee_number
    FROM employees
    WHERE employee_id = ?
  `;

  const [mgrRows]: any = await pool.query(mgrSql, [manager_id]);

  if (mgrRows.length === 0) {
    return [];
  }

  const managerEmployeeNumber = mgrRows[0].employee_number;
  const sql = `
    SELECT 
      e_emp.employee_id,
      e_emp.employee_number,
      e_emp.full_name,
      e_emp.work_email,
      ed_emp.job_title
    FROM employment_details ed_emp
    JOIN employees e_emp 
      ON ed_emp.employee_id = e_emp.employee_id
    WHERE ed_emp.reporting_manager_employee_number = ?
  `;

  const [rows]: any = await pool.query(sql, [managerEmployeeNumber]);

  return rows;
}

public static async getShiftPolicyService(shift_policy_name: string) {
  const sql = `
    SELECT shift_name, check_in, check_out
    FROM shift_policy
    WHERE shift_name = ?
  `;

  const [rows]: any = await pool.query(sql, [shift_policy_name]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

}
