"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
class AttendanceService {
    static async countLogin(data) {
        let [myworkistogetdata] = [];
        const count = {
            number: 0,
            status: true,
        };
        try {
            [myworkistogetdata] = await database_1.pool.query('Select count(*) as counter from attendance where employee_id = ? and attendance_date = curdate()', [data.employee_id]);
            if (myworkistogetdata[0].counter > 0) {
                throw new Error();
            }
            else {
                return count;
            }
        }
        catch (e) {
            count.number = myworkistogetdata[0].counter;
            count.status = false;
            console.log(count);
            return count;
        }
    }
    static async clockIn(data) {
        try {
            const query = `
        INSERT INTO attendance (employee_id, attendance_date, check_in)
        VALUES (?, CURDATE(), ?)
      `;
            const [result] = await database_1.pool.query(query, [
                data.employee_id,
                data.check_in,
            ]);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    static async clockOut(data) {
        try {
            const [openRecords] = await database_1.pool.query(`SELECT attendance_id as id FROM attendance 
       WHERE attendance_date = CURDATE()
         AND employee_id = ?
         AND check_out IS NULL
       ORDER BY check_in DESC
       LIMIT 1`, [data.employee_id]);
            if (openRecords.length === 0) {
                return { status: false, message: 'You are not clocked in today' };
            }
            const attendanceId = openRecords[0].id;
            const [result] = await database_1.pool.query(`UPDATE attendance 
       SET check_out = ? 
       WHERE attendance_id = ?`, [data.check_out, attendanceId]);
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
        }
        catch (err) {
            console.error('Error in clockOut:', err);
            throw err;
        }
    }
    static async getAttendance(data) {
        try {
            let query = `select * from attendance where employee_id = ?`;
            const params = [data.employee_id];
            if (data.startDate && data.endDate) {
                query += ` and attendance_date between ? and ?`;
                params.push(data.startDate, data.endDate);
            }
            else if (data.date) {
                query += ` and attendance_date = ?`;
                params.push(data.date);
            }
            const [result] = await database_1.pool.query(query, params);
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    static async notinyet() {
        const [all_Candidates] = await database_1.pool.query("select id from candidates where status = 'accepted'");
        const [in_candidates] = await database_1.pool.query('select employee_id from attendance where attendance_date = curdate()');
        const inCandidateIds = new Set(in_candidates.map((c) => c.employee_id));
        const notCheckedIn = all_Candidates.filter((candidate) => !inCandidateIds.has(candidate.id));
        return notCheckedIn;
    }
    static async upsertAttendanceRecord(data) {
        const { employeeId, clockInTime, accumulatedMs, isClockedIn } = data;
        const [existing] = await database_1.pool.query(`SELECT record_id FROM attendance_records WHERE employee_id = ?`, [employeeId]);
        if (existing.length > 0) {
            const recordId = existing[0].record_id;
            await database_1.pool.query(`UPDATE attendance_records 
         SET clock_in_time = ?, accumulated_ms = ?, is_clocked_in = ?, updated_at = NOW()
         WHERE record_id = ?`, [clockInTime, accumulatedMs, isClockedIn, recordId]);
            return { message: 'Attendance record updated', recordId };
        }
        else {
            const [result] = await database_1.pool.query(`INSERT INTO attendance_records (employee_id, clock_in_time, accumulated_ms, is_clocked_in)
         VALUES (?, ?, ?, ?)`, [employeeId, clockInTime, accumulatedMs, isClockedIn]);
            return {
                message: 'Attendance record created',
                recordId: result.insertId,
            };
        }
    }
    static async addAttendanceEvent(data) {
        const { recordId, eventType, eventTime, displayTime } = data;
        const [result] = await database_1.pool.query(`INSERT INTO attendance_events (record_id, event_type, event_time, display_time)
       VALUES (?, ?, ?, ?)`, [recordId, eventType, eventTime, displayTime]);
        return { message: 'Event added', eventId: result.insertId };
    }
    static async upsertDailyAccumulation(data) {
        const { recordId, workDate, accumulatedMs } = data;
        await database_1.pool.query(`INSERT INTO attendance_daily_accumulation (record_id, work_date, accumulated_ms)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE accumulated_ms = VALUES(accumulated_ms), updated_at = NOW()`, [recordId, workDate, accumulatedMs]);
        return { message: 'Daily accumulation updated' };
    }
    static async getEmployeeAttendance(employeeId) {
        const [records] = await database_1.pool.query(`SELECT * FROM attendance_records WHERE employee_id = ?`, [employeeId]);
        if (records.length === 0)
            return null;
        const record = records[0];
        const [events] = await database_1.pool.query(`SELECT * FROM attendance_events WHERE record_id = ? ORDER BY event_time ASC`, [record.record_id]);
        const [daily] = await database_1.pool.query(`SELECT * FROM attendance_daily_accumulation WHERE record_id = ? ORDER BY work_date ASC`, [record.record_id]);
        return {
            ...record,
            history: events,
            dailyAccumulated: daily,
        };
    }
    static async getTodayAttendance(asdfads) {
        const [adfasd] = await database_1.pool.query(`SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()`, [asdfads]);
        return adfasd;
    }
    static async getTodayAttendanceExtra(emp_id, asdfads) {
        const [adfasd] = await database_1.pool.query(`SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = ?`, [emp_id, asdfads]);
        return adfasd;
    }
    static async qeiwoi(asdads) {
        const [adfasd] = await database_1.pool.query(`SELECT shift_policy_name FROM employment_details WHERE employee_id = ?`, [asdads]);
        if (adfasd.length === 0) {
            return { shift_policy_name: 'Default' };
        }
        return adfasd[0];
    }
    static async qeiwoasi(asdads) {
        const [adfasd] = await database_1.pool.query(`SELECT check_in, check_out FROM shift_policy WHERE shift_name = ?`, [asdads.trim()]);
        return { check_in: adfasd[0].check_in, check_out: adfasd[0].check_out };
    }
}
exports.default = AttendanceService;
//# sourceMappingURL=attendance-service.js.map