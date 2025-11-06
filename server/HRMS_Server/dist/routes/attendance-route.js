"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = __importDefault(require("../controller/attendance-controller"));
const cookie_parser_middleware_1 = require("../middlewares/cookie-parser-middleware");
const attendance_middleware_1 = require("../middlewares/attendance.middleware");
const AttendanceRouter = (0, express_1.Router)();
AttendanceRouter.post('/v1/clockin', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.handleClockIn);
AttendanceRouter.post('/v1/clockout', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.handleClockOut);
AttendanceRouter.post('/v1/get-attendance', 
// verifyAccessToken,
attendance_controller_1.default.getAttendance);
AttendanceRouter.post('/v1/upsert-record', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.upsertAttendanceRecord);
AttendanceRouter.post('/v1/add-event', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.addAttendanceEvent);
AttendanceRouter.post('/v1/upsert-daily', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.upsertDailyAccumulation);
AttendanceRouter.get('/v1/get-attendance/:employeeId', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.getEmployeeAttendance);
AttendanceRouter.get('/v1/notinyet', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.notinyet);
AttendanceRouter.post('/v1/check-attendance-status', cookie_parser_middleware_1.verifyAccessToken, attendance_controller_1.default.llakdjlfjas);
AttendanceRouter.post('/v1/attendance', attendance_middleware_1.kjhkhk, attendance_controller_1.default.kasdja);
exports.default = AttendanceRouter;
//# sourceMappingURL=attendance-route.js.map