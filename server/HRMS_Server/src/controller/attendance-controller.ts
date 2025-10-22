import { Request, Response } from 'express';
import { TT, TO } from '../interface/attendance-interface';
import AttendanceService from '../services/attendance-service';

export default class AttendanceController {
  public static async handleClockIn(req: Request, res: Response) {
    const { employee_id, check_in }: TT = req.body;
    if (!employee_id) {
      return res.status(400).json({ message: 'employee_id is required' });
    }
    if (typeof employee_id != 'number') {
      return res.status(400).json({ message: 'Not Valid Employee Number' });
    }
    const response = await AttendanceService.countLogin({
      employee_id,
      check_in,
    });
    if (response.number == 0) {
      try {
        const result = await AttendanceService.clockIn({
          employee_id,
          check_in,
        });
        res.json({ message: 'Clock-in successful', data: result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(400).json({ message: 'Already Logged In.' });
    }
  }
  public static async handleClockOut(req: Request, res: Response) {    
    const { employee_id, check_out }: TO = req.body;
    if (!employee_id) {
      return res.status(400).json({ message: 'employee_id is required' });
    }
    if (typeof employee_id != 'number') {
      return res.status(400).json({ message: 'Not Valid Employee Number' });
    }
    try {
      const result = await AttendanceService.clockOut({
        employee_id,
        check_out,
      });
      res.json({ message: 'Clock-Out successful', data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async getAttendance(req: Request, res: Response) {
    if (!req.body.employee_id) {
      return res.status(400).json({ message: 'employee_id is required' });
    } else {
      if (req.body.startDate && req.body.endDate) {
        const result = await AttendanceService.getAttendance({
          employee_id: req.body.employee_id,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        });
        res.status(200).json({ attendance: result });
      } else {
        const result = await AttendanceService.getAttendance({
          employee_id: req.body.employee_id,
        });
        res.status(200).json({ attendance: result });
      }
    }
  }
  public static async notinyet(req: Request, res: Response) {
    const result = await AttendanceService.notinyet();
    res.json({
      not_in: result,
      count: result.length,
    });
  }
}
