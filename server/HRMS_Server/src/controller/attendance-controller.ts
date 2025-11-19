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
      let result;
      if (req.body.startDate && req.body.endDate) {
        result = await AttendanceService.getAttendance({
          employee_id: req.body.employee_id,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        });
      } else if (req.body.date) {
        result = await AttendanceService.getTodayAttendanceExtra(
          req.body.employee_id,
          req.body.date
        );
        // Arrival time is already calculated in the service method
      } else {
        result = await AttendanceService.getAttendance({
          employee_id: req.body.employee_id,
        });
      }

      res.status(200).json({ attendance: result });
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

    console.log('Checking attendance for employee:', reeq.body.employee_id);
    const resu = await AttendanceService.getTodayAttendance(
      reeq.body.employee_id
    );

    if (resu.length === 0) {
      return res.status(200).json({
        message: 'No Attendance Found',
        clockin: false,
        clockout: false,
        attendance_id: null,
        employee_id: reeq.body.employee_id,
        attendance_date: new Date().toLocaleDateString(),
        arrival_time: null,
        departure_time: null,
      });
    }

    const attendance = resu[0];

    res.status(200).json({
      clockin: attendance.first_check_in != null,
      clockout: attendance.last_check_out != null,
      attendance_id: attendance.attendance_id,
      employee_id: attendance.employee_id,
      attendance_date: new Date(
        attendance.attendance_date
      ).toLocaleDateString(),
      arrival_time: attendance.arrival_time,
      departure_time: attendance.departure_time,
      status: attendance.status,
      late_duration: attendance.late_duration,
      is_on_time: attendance.status === 'on_time',
    });
  }

  public static async kasdja(req: Request, res: Response) {
    console.log("d");
    
    try {
      const { LogType, EmpID } = req.body;
      console.log("emp", LogType);
      
      const currentTime = String(new Date().toTimeString().split(' ')[0]);
      const currentDate = String(new Date().toISOString().split('T')[0]);

      const todayRecords: any = await AttendanceService.getAttendance({
        employee_id: EmpID,
        date: currentDate,
      });
      const { shift_policy_name } = await AttendanceService.qeiwoi(EmpID);
      if (!shift_policy_name) {
        return res.status(400).json({
          status: false,
          message: 'No Shift Policy Assigned, contact administrator',
        });
      }
      const shiftPolicy = await AttendanceService.qeiwoasi(shift_policy_name);
      if (!shiftPolicy) {
        return res.status(400).json({
          status: false,
          message: 'No Shift Policy, contact administrator',
        });
      }
      if (LogType === 'IN') {
        const hasOpenSession = todayRecords.some(
          (rec: any) => rec.check_in && !rec.check_out
        );

        if (hasOpenSession) {
          return res.status(400).json({
            status: false,
            message: 'Already Clocked In — please Clock Out first',
          });
        }
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
          currentDate: currentDate,
          late: {
            shift_check_in: shiftPolicy.check_in,
            actual_check_in: currentTime,
            is_late: isLate,
            diff: timeDiff,
          },
          data: clockInResult,
        });
      }

      if (LogType === 'OUT') {
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

        const openSession = todayRecords.find(
          (rec: any) => rec.check_in && !rec.check_out
        );

        if (!openSession) {
          return res.status(400).json({
            status: false,
            message: 'You are not clocked in today',
          });
        }

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
          currentDate: currentDate,
          data: clockOutResult,
          shift_check_out: shiftPolicy.check_out,
        });
      }

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

  public static async createShiftPolicy(req: Request, res: Response) {
    try {
      const { shift_name, check_in, check_out } = req.body;

      if (!shift_name || !check_in || !check_out) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: shift_name, check_in, check_out',
        });
      }

      const result = await AttendanceService.createShiftPolicyService({
        shift_name,
        check_in,
        check_out,
      });

      res.status(result.isUpdate ? 200 : 201).json({
        success: true,
        message: result.isUpdate
          ? 'Shift policy updated successfully'
          : 'Shift policy created successfully',
        data: result,
      });
    } catch (err) {
      console.error('Error creating/updating shift policy:', err);
      res.status(500).json({
        success: false,
        message: 'Server error, unable to create/update shift policy',
      });
    }
  }

  public static async getEmployeesUnderManager(req: Request, res: Response) {
  try {
    const { manager_id } = req.params;

    if (!manager_id) {
      return res.status(400).json({
        success: false,
        message: "manager_id parameter is required",
      });
    }

    const result = await AttendanceService.getEmployeesUnderManagerService(
      Number(manager_id)
    );

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error fetching employees under manager:", err);

    res.status(500).json({
      success: false,
      message: "Server error, unable to fetch employee list",
    });
  }
}

public static async getShiftPolicy(req: Request, res: Response) {
  try {
    const { shift_policy_name } = req.body;

    if (!shift_policy_name) {
      return res.status(400).json({
        success: false,
        message: "shift policy is required",
      });
    }

    const result = await AttendanceService.getShiftPolicyService(String(shift_policy_name));

    res.status(200).json({
      success: true,
      message: "Shift policy fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error fetching shift policy:", err);

    res.status(500).json({
      success: false,
      message: "Server error, unable to fetch shift policy",
    });
  }
}

}
