import { pool } from '../../config/database';
import { Request, Response } from 'express';
import { WorkTrack } from '../interface/work-track';
import { console } from 'inspector';
import { date } from 'joi';

export class WorkTrackService {
  public static async saveWorkReport(data: WorkTrack) {
    const [rows] = await pool.query(
      `select * from work_report where employee_id = ? and date = ?`,
      [data.employee_id, data.date]
    )

    if ((rows as any[]).length > 0) {
      throw new Error('Work report for this employee on the given date already exists.');
    } else {
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
        await pool.query(
          `INSERT INTO work_report (employee_id, date, task_start_time, task_end_time, task, project, type, technology) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [hour.employee_id, hour.date, hour.start_time, hour.end_time, hour.task, hour.project, hour.type, hour.technology]
        );
      }
      return result;
    }
  }

  public static async getWorkReport(employee_id: number, date: string) {

    const [rows]: any = await pool.query(
      `SELECT 
          employee_id,
          date,
          task_start_time AS start_time,
          task_end_time AS end_time,
          task,
          project,
          type,
          technology
       FROM work_report
       WHERE employee_id = ? AND date = ?
       ORDER BY task_start_time ASC`,
      [employee_id, date]
    );

    if ((rows as any[]).length === 0) {
      return { message: 'No work report found for this employee on given date.' };
    }

    // build same format as saveWorkReport input
    const technologies = rows[0].technology
      ? JSON.parse(rows[0].technology)
      : [];

    const hours = (rows as any[]).map(row => ({
      start_time: row.start_time,
      end_time: row.end_time,
      task: row.task,
      project: row.project,
      type: row.type
    }));

    return {
      employee_id,
      date,
      technologies,
      hours
    };
  }

  public static async getAllWorkReport(employee_id: number) {

    const [rows]: any = await pool.query(
      `SELECT 
        employee_id,
        date,
        task_start_time AS start_time,
        task_end_time AS end_time,
        task,
        project,
        type,
        technology
     FROM work_report
     WHERE employee_id = ?
     ORDER BY date ASC, task_start_time ASC`,
      [employee_id]
    );

    if ((rows as any[]).length === 0) {
      return { message: 'No work report found for this employee.' };
    }

    const technologies = rows[0].technology
      ? JSON.parse(rows[0].technology)
      : [];

    // ✅ Grouping by Date
    const groupedByDate = (rows as any[]).reduce((acc: any, row: any) => {

      const date: any = new Date(row.date).toISOString().split('T')[0];  // yyyy-mm-dd

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push({
        start_time: row.start_time,
        end_time: row.end_time,
        task: row.task,
        project: row.project,
        type: row.type
      });

      // Sort each date hours by time
      acc[date].sort((a: any, b: any) => {
        const timeA = new Date(`1970-01-01 ${a.start_time}`).getTime();
        const timeB = new Date(`1970-01-01 ${b.start_time}`).getTime();
        return timeA - timeB;
      });

      return acc;
    }, {});

    return {
      employee_id,
      technologies,
      date: groupedByDate   // ✅ your required format
    };
  }


}

