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
  profilepictypechecker,
  verifyAccessToken,
} from '../middlewares/cookie-parser-middleware';
import EmployeeController from '../controller/employee-controller';
import LeaveController from '../controller/leave.controller';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14);

    const empId = (req.body as any)?.employee_id || 'unknown';
    const cleanBase = `employee_${empId}_${timestamp}${ext}`;

    cb(null, cleanBase);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({ storage });
export const image = multer({ storage, fileFilter });

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: true,
    message: '✅ HRMS API is running successfully!',
    time: new Date().toLocaleString(),
  });
});

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
  '/v1/forgot-password-email',
  checkWhoAmI,
  EmployeeLoginController.ForgotEmailCheck
);
router.post('/v1/forgot-password', EmployeeLoginController.forgot);
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
router.post('/v1/bulk-data-entry', EmployeeController.insertBulkEmployees);
router.post(
  '/v1/employee',
  verifyAccessToken,
  EmployeeController.viewAllEmployeesEverything
);
router.post('/v1/log-out', verifyAccessToken, EmployeeLoginController.LogOut);

router.post('/v1/forgot-pwd', EmployeeLoginController.ForgotPwd);
router.post('/v1/add-pwd', EmployeeLoginController.PasswordGeneratorHey);
router.post('/v1/change-pwd', EmployeeLoginController.ChangePwd);
router.post('/v1/change-new-pwd', EmployeeLoginController.PasswordGeneratorHey);

router.post(
  '/v1/leave-balance',

  LeaveController.createLeaveBalance
);
router.get(
  '/v1/leave-balance',

  LeaveController.getLeaveBalances
);

router.post(
  '/v1/leave-request',

  LeaveController.createLeaveRequest
);
router.get(
  '/v1/leave-request',

  LeaveController.getLeaveRequests
);

router.post(
  '/v1/add-leaves-all',

  LeaveController.addLeaves
);

router.post(
  '/v1/get-leaves-requests',

  LeaveController.getLeaveRequest
);

// Admin route
router.get('/1/admin', (req, res) => {
  res.status(200).json({
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin'
  });
});
router.post(
  '/v1/get-leaves-balance',

  LeaveController.getLeaves
);
router.post(
  '/v1/employee/profile-pic/upsert',
  (req, res, next) => {
    image.single('image')(req, res, (err) => {
      if (err instanceof Error) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  EmployeeController.uploadAndUpsert
);
router.get('/v1/image/:image_name', EmployeeController.serveImage);

router.post('/v1/test-api', EmployeeLoginController.getRole);

router.post(
  '/v1/cancel-leave',
  //verifyAccessToken
  LeaveController.cancelLeaveRequest
)

router.post(
  '/v1/leave-action',
  // verifyAccessToken,
  LeaveController.takeActionLeaveRequest
);
// test apis here 🤡
router.post('/v1/test-api', EmployeeLoginController.getRole)
// add test apis here only
export default router;
