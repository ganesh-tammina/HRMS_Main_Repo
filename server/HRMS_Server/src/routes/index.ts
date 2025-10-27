import { Router } from 'express';
import MailController from '../controller/mail-sender-controller/mailer-controller';
import multer from 'multer';
import EmployeeLoginController from '../controller/employee-login-controller';
import AdminController from '../controller/admin-controller';
import {
  checkIfIamEmployeeAtAll,
  checkIfIamValidEmployee,
  checkMyRole,
  checkWhoAmI,
  verifyAccessToken,
} from '../middlewares/cookie-parser-middleware';
import EmployeeController from '../controller/employee-controller';
import LeaveController from '../controller/leave.controller';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/v1/send-email', MailController.mailsender);

router.post('/v1/check-email', checkWhoAmI, EmployeeLoginController.EmailCheck);
router.post(
  '/v1/gen-password',
  checkIfIamValidEmployee,
  EmployeeLoginController.PasswordGeneratorHey
);
router.post(
  '/v1/login',
  checkIfIamEmployeeAtAll,
  EmployeeLoginController.Login
);

router.post(
  '/v1/parse-excel',
  upload.single('file'),
  AdminController.uploadExcel
);

router.post('/v1/addEmployee', EmployeeController.insertEmployee);
router.post(
  '/v1/addEmployementDetails',
  EmployeeController.insertEmploymentDetails
);
router.post(
  '/v1/add-Statutory-Info',
  EmployeeController.insertEmployeeStatutoryInfo
);
router.post(
  '/v1/add-Employee-Family-Info',
  EmployeeController.insertEmployeeFamilyInfo
);
router.post('/v1/addExitDetails', EmployeeController.insertExitDetails);
router.post(
  '/v1/current-address',
  EmployeeController.insertEmployeeCurrentAddress
);
router.post(
  '/v1/permanent-address',
  EmployeeController.insertEmployeePermanentAddress
);
router.post(
  '/v1/bulk-data-entry',
  verifyAccessToken,
  checkMyRole,
  EmployeeController.insertBulkEmployees
);
router.post(
  '/v1/employee',
  verifyAccessToken,
  checkMyRole,
  EmployeeController.viewAllEmployeesEverything
);
router.post('/v1/log-out', verifyAccessToken, EmployeeLoginController.LogOut);

router.post('/v1/leave-balance', verifyAccessToken, LeaveController.createLeaveBalance);
router.get('/v1/leave-balance', verifyAccessToken, LeaveController.getLeaveBalances);
router.post('/v1/leave-request', verifyAccessToken, LeaveController.createLeaveRequest);
router.get('/v1/leave-request', verifyAccessToken, LeaveController.getLeaveRequests);


router.post(
  '/v1/leave-balance',
  verifyAccessToken,
  LeaveController.createLeaveBalance
);
router.get(
  '/v1/leave-balance',
  verifyAccessToken,
  LeaveController.getLeaveBalances
);
router.post(
  '/v1/leave-request',
  verifyAccessToken,
  LeaveController.createLeaveRequest
);
router.get(
  '/v1/leave-request',
  verifyAccessToken,
  LeaveController.getLeaveRequests
);

// test apis here 🤡

// add test apis here only 
export default router;
