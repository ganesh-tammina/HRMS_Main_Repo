import { pool } from '../../config/database';
import { Request, Response } from 'express';
import { WorkTrack } from '../interface/work-track';
import { console } from 'inspector';

export class WorkTrackService {
  public static async saveWorkReport(data: WorkTrack) {
    
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

