import { Router } from "express";
import MailController from "../controller/mail-sender-controller/mailer-controller";
import { Request, Response } from "express";
import { readFile } from "fs/promises";
import multer from "multer";
import EmployeeLoginController from "../controller/employee-login-controller";
import AdminController from "../controller/admin-controller";
import { checkIfIamEmployeeAtAll, checkIfIamValidEmployee, checkMyRole, checkWhoAmI, verifyAccessToken } from "../middlewares/cookie-parser-middleware";
import EmployeeController from "../controller/employee-controller";
import AttendanceController from "../controller/attendance-controller";
import LeaveController from "../controller/leave.controller";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post("/v1/send-email", MailController.mailsender);

router.post("/v1/check-email", checkWhoAmI, EmployeeLoginController.EmailCheck);
router.post("/v1/gen-password", checkIfIamValidEmployee, EmployeeLoginController.PasswordGeneratorHey)
router.post("/v1/login", checkIfIamEmployeeAtAll, EmployeeLoginController.Login)

router.post("/v1/parse-excel", upload.single("file"), AdminController.uploadExcel);

router.post("/v1/addEmployee", EmployeeController.insertEmployee);
router.post("/v1/addEmployementDetails", EmployeeController.insertEmploymentDetails);
router.post("/v1/add-Statutory-Info", EmployeeController.insertEmployeeStatutoryInfo);
router.post("/v1/add-Employee-Family-Info", EmployeeController.insertEmployeeFamilyInfo);
router.post("/v1/addExitDetails", EmployeeController.insertExitDetails);
router.post("/v1/current-address", EmployeeController.insertEmployeeCurrentAddress);
router.post("/v1/permanent-address", EmployeeController.insertEmployeePermanentAddress);
router.post("/v1/bulk-data-entry",verifyAccessToken, checkMyRole, EmployeeController.insertBulkEmployees);
router.post("/v1/employee", verifyAccessToken, checkMyRole, EmployeeController.viewAllEmployeesEverything);
router.post("/v1/log-out",verifyAccessToken, EmployeeLoginController.LogOut)

router.post('/v1/clockin',verifyAccessToken, AttendanceController.handleClockIn);
router.post('/v1/clockout',verifyAccessToken, AttendanceController.handleClockOut);
router.post('/v1/get-attendance',verifyAccessToken, AttendanceController.getAttendance);
router.post( '/v1/upsert-record', verifyAccessToken, AttendanceController.upsertAttendanceRecord);
router.post( '/v1/add-event', verifyAccessToken, AttendanceController.addAttendanceEvent);
router.post( '/v1/upsert-daily', verifyAccessToken, AttendanceController.upsertDailyAccumulation);
router.get( '/v1/get-attendance/:employeeId', verifyAccessToken,  AttendanceController.getEmployeeAttendance);
router.get('/v1/notinyet',verifyAccessToken, AttendanceController.notinyet);

router.post('/v1/leave-balance',verifyAccessToken, LeaveController.createLeaveBalance);
router.get('/v1/leave-balance',verifyAccessToken, LeaveController.getLeaveBalances);
router.post('/v1/leave-request',verifyAccessToken, LeaveController.createLeaveRequest);
router.get('/v1/leave-request',verifyAccessToken, LeaveController.getLeaveRequests);




// test apis here 🤡
router.get

export default router;
