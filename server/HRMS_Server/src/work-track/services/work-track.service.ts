import { pool } from '../../config/database';
import { Request, Response } from 'express';
import { WorkTrack } from '../interface/work-track';
import { console } from 'inspector';

export class WorkTrackService {
  public static async saveWorkReport(data: WorkTrack) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        `SELECT * FROM work_report WHERE employee_id = ? AND date = ?`,
        [data.employee_id, data.date]
      );

      if ((rows as any[]).length > 0) {
        throw new Error('Work report for this employee on the given date already exists.');
      }

      const result = data.hours.map(h => ({
        employee_id: data.employee_id,
        date: data.date,
        start_time: h.start_time,
        end_time: h.end_time,
        task: h.task,
        project: h.project,
        type: h.type,
        technology: JSON.stringify(data.technologies)
      }));

      for (const hour of result) {
        await connection.query(
          `INSERT INTO work_report (employee_id, date, task_start_time, task_end_time, task, project, type, technology) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [hour.employee_id, hour.date, hour.start_time, hour.end_time, hour.task, hour.project, hour.type, hour.technology]
        );
      }

      await connection.query(
        `INSERT INTO dailyworklogs (employee_id, date, work_hours) VALUES (?, ?, ?)`,
        [data.employee_id, data.date, data.total]
      );

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error('Error saving work report:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  public static async getWorkReportsByEmployeeId(employeeId: number) {
    const [workReports] = await pool.query(
      `SELECT * FROM work_report WHERE employee_id = ?`,
      [employeeId]
    );
    const [workHours] = await pool.query(
      `SELECT date, work_hours FROM dailyworklogs WHERE employee_id = ?`,
      [employeeId]
    );
    return { workReports, workHours };
  }

  public static async getWorkReportsByDateRange(employeeId: number, startDate: string, endDate: string) {
    const [workReports] = await pool.query(
      `SELECT * FROM work_report WHERE employee_id = ? AND date BETWEEN ? AND ?`,
      [employeeId, startDate, endDate]
    );
    const [workHours] = await pool.query(
      `SELECT date, work_hours FROM dailyworklogs WHERE employee_id = ? AND date BETWEEN ? AND ?`,
      [employeeId, startDate, endDate]
    );
    return { workReports, workHours };
  }
}

