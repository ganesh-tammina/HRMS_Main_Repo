import { Request, Response } from 'express';
import { Router } from 'express';
import AttendanceController from '../controller/attendance-controller';
import { verifyAccessToken } from '../middlewares/cookie-parser-middleware';
import { kjhkhk } from '../middlewares/attendance.middleware';

const AttendanceRouter = Router();

AttendanceRouter.post(
  '/v1/clockin',
  verifyAccessToken,
  AttendanceController.handleClockIn
);
AttendanceRouter.post(
  '/v1/clockout',
  verifyAccessToken,
  AttendanceController.handleClockOut
);
AttendanceRouter.post(
  '/v1/get-attendance',
  // verifyAccessToken,
  AttendanceController.getAttendance
);
AttendanceRouter.post(
  '/v1/upsert-record',
  verifyAccessToken,
  AttendanceController.upsertAttendanceRecord
);
AttendanceRouter.post(
  '/v1/add-event',
  verifyAccessToken,
  AttendanceController.addAttendanceEvent
);
AttendanceRouter.post(
  '/v1/upsert-daily',
  verifyAccessToken,
  AttendanceController.upsertDailyAccumulation
);
AttendanceRouter.get(
  '/v1/get-attendance/:employeeId',
  verifyAccessToken,
  AttendanceController.getEmployeeAttendance
);
AttendanceRouter.get(
  '/v1/notinyet',
  verifyAccessToken,
  AttendanceController.notinyet
);
AttendanceRouter.post(
  '/v1/check-attendance-status',
  verifyAccessToken,
  AttendanceController.llakdjlfjas
);




//adding shifts
AttendanceRouter.post('/v1/attendance', kjhkhk, AttendanceController.kasdja)
export default AttendanceRouter;
