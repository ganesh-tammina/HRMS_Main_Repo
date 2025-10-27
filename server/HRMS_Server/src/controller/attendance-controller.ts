import { Request, Response } from 'express';
import { TT, TO } from '../interface/attendance-interface';
import AttendanceService from '../services/attendance-service';
import { get } from 'http';
import { diff } from 'util';

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

  public static async llakdjlfjas(reeq: Request, res: Response) {
    if (!reeq.body?.employee_id) {
      return res.status(400).json({ message: 'employee_id is required' });
    }
    const resu = await AttendanceService.getTodayAttendance(
      reeq.body.employee_id
    );
    if (resu.length === 0) {
      res.status(200).json({ message: 'No Attendance Found' });
    }
    res.status(200).json({
      clockin: resu[0].check_in != null ? true : false,
      clockout: resu[0].check_out != null ? true : false,
      attendance_id: resu[0].attendance_id,
      employee_id: resu[0].employee_id,
      attendance_date: new Date(resu[0].attendance_date).toLocaleDateString(),
    });
  }

  public static async kasdja(req: Request, res: Response) {
    try {
      const { LogType, EmpID } = req.body;
      const currentTime = String(new Date().toTimeString().split(' ')[0]);
      const currentDate = String(new Date().toISOString().split('T')[0]);

      // Fetch today's attendance record(s)
      const todayRecords: any = await AttendanceService.getAttendance({
        employee_id: EmpID,
        date: currentDate,
      });

      // ---- CLOCK IN ----
      if (LogType === 'IN') {
        // Check if user has any open (not clocked-out) attendance
        const hasOpenSession = todayRecords.some(
          (rec: any) => rec.check_in && !rec.check_out
        );

        if (hasOpenSession) {
          return res.status(400).json({
            status: false,
            message: 'Already Clocked In — please Clock Out first',
          });
        }

        // Get shift info
        const { shift_policy_name } = await AttendanceService.qeiwoi(EmpID);
        const shiftPolicy = await AttendanceService.qeiwoasi(shift_policy_name);

        // Clock in
        const clockInResult = await AttendanceService.clockIn({
          employee_id: EmpID,
          check_in: currentTime,
        });

        const isLate = currentTime > shiftPolicy.check_in;
        const timeDiff = AttendanceController.diff
          ? AttendanceController.diff(currentTime, shiftPolicy.check_in)
          : null;

        return res.status(200).json({
          status: true,
          message: 'Clocked In Successfully',
          late: {
            shift_check_in: shiftPolicy.check_in,
            actual_check_in: currentTime,
            is_late: isLate,
            diff: timeDiff,
          },
          data: clockInResult,
        });
      }

      // ---- CLOCK OUT ----
      if (LogType === 'OUT') {
        // Fetch today's attendance
        const todayRecords: any = await AttendanceService.getAttendance({
          employee_id: EmpID,
          date: currentDate,
        });

        if (!todayRecords || todayRecords.length === 0) {
          return res.status(400).json({
            status: false,
            message: 'You are not clocked in today',
          });
        }

        // Find the latest open session (check_in exists but check_out is null)
        const openSession = todayRecords.find(
          (rec: any) => rec.check_in && !rec.check_out
        );

        if (!openSession) {
          return res.status(400).json({
            status: false,
            message: 'You are not clocked in today',
          });
        }

        // Proceed to clock out
        const clockOutResult = await AttendanceService.clockOut({
          employee_id: EmpID,
          check_out: currentTime,
        });

        if (clockOutResult.status === false) {
          return res.status(400).json(clockOutResult);
        }

        return res.status(200).json({
          status: true,
          message: 'Clocked Out Successfully',
          data: clockOutResult,
        });
      }

      // Invalid log type
      return res
        .status(400)
        .json({ status: false, message: 'Invalid LogType' });
    } catch (err: any) {
      console.error('Error in kasdja:', err);
      return res.status(500).json({
        status: false,
        message: 'Server Error',
        error: err.message,
      });
    }
  }

  static diff(time1: string, time2: string): string {
    const [h1, m1, s1]: any = time1.split(':').map(Number);
    const [h2, m2, s2]: any = time2.split(':').map(Number);
    const date1 = new Date();
    date1.setHours(h1, m1, s1, 0);
    const date2 = new Date();
    date2.setHours(h2, m2, s2, 0);
    let diffMs = Math.abs(date1.getTime() - date2.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    diffMs -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diffMs / (1000 * 60));
    diffMs -= minutes * 1000 * 60;
    const seconds = Math.floor(diffMs / 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
