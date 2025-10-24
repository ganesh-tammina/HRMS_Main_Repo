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
  public static async upsertAttendanceRecord(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await AttendanceService.upsertAttendanceRecord(req.body);
      res.status(200).json({
        success: true,
        message: result.message,
        recordId: result.recordId,
      });
    } catch (error: any) {
      console.error(
        '[AttendanceController] upsertAttendanceRecord error:',
        error
      );
      res
        .status(500)
        .json({ success: false, error: 'Failed to upsert attendance record' });
    }
  }

  public static async addAttendanceEvent(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await AttendanceService.addAttendanceEvent(req.body);
      res.status(200).json({
        success: true,
        message: result.message,
        eventId: result.eventId,
      });
    } catch (error: any) {
      console.error('[AttendanceController] addAttendanceEvent error:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to add attendance event' });
    }
  }

  public static async upsertDailyAccumulation(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await AttendanceService.upsertDailyAccumulation(req.body);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      console.error(
        '[AttendanceController] upsertDailyAccumulation error:',
        error
      );
      res
        .status(500)
        .json({ success: false, error: 'Failed to upsert daily accumulation' });
    }
  }

  public static async getEmployeeAttendance(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      if (!req.params.employeeId) {
        res
          .status(400)
          .json({ success: false, error: 'employeeId parameter is required' });
        return;
      }
      const employeeId = parseInt(req.params.employeeId, 10);

      if (isNaN(employeeId)) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid employeeId parameter' });
        return;
      }

      const data = await AttendanceService.getEmployeeAttendance(employeeId);

      if (!data) {
        res.status(404).json({
          success: false,
          message: 'No attendance found for this employee',
        });
        return;
      }

      res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error(
        '[AttendanceController] getEmployeeAttendance error:',
        error
      );
      res
        .status(500)
        .json({ success: false, error: 'Failed to fetch attendance data' });
    }
  }
}
