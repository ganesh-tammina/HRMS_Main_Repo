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
      let query = `select * from attendance where employee_id = ?`;
      const params: any[] = [data.employee_id];
      if (data.startDate && data.endDate) {
        query += ` and attendance_date between ? and ?`;
        params.push(data.startDate, data.endDate);
      } else if (data.date) {
        query += ` and attendance_date = ?`;
        params.push(data.date);
      }

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
    const [adfasd]: any = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()`,
      [asdfads]
    );
    return adfasd;
  }
  public static async getTodayAttendanceExtra(emp_id: string, asdfads: string) {
    const [adfasd]: any = await pool.query(
      `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?`,
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
}
