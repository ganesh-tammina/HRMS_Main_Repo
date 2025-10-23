import { pool } from '../config/database';
import { TO, TT } from '../interface/attendance-interface';

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
    const [ifIn]: any = await pool.query(
      `select count(*) as count from attendance where attendance_date = curdate() and employee_id = ?`,
      [data.employee_id]
    );
    if (ifIn[0].count === 1) {
      try {
        const query = `
        Update attendance set check_out = ?
       where employee_id = ?
      `;
        const [result] = await pool.query(query, [
          data.check_out,
          data.employee_id,
        ]);
        return { check_out: data.check_out, date: new Date(), result };
      } catch (err) {
        throw err;
      }
    } else {
      return 'Not Allowed, contact system Admin.';
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
}
