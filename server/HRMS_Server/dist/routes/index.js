"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_controller_1 = __importDefault(require("../controller/mail-sender-controller/mailer-controller"));
const multer_1 = __importDefault(require("multer"));
const employee_login_controller_1 = __importDefault(require("../controller/employee-login-controller"));
const admin_controller_1 = __importDefault(require("../controller/admin-controller"));
const cookie_parser_middleware_1 = require("../middlewares/cookie-parser-middleware");
const employee_controller_1 = __importDefault(require("../controller/employee-controller"));
const leave_controller_1 = __importDefault(require("../controller/leave.controller"));
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
router.post('/v1/send-email', mailer_controller_1.default.mailsender);
router.post('/v1/check-email', cookie_parser_middleware_1.checkWhoAmI, employee_login_controller_1.default.EmailCheck);
router.post('/v1/gen-password', cookie_parser_middleware_1.checkIfIamValidEmployee, employee_login_controller_1.default.PasswordGeneratorHey);
router.post('/v1/login', cookie_parser_middleware_1.checkIfIamEmployeeAtAll, employee_login_controller_1.default.Login);
router.post('/v1/parse-excel', upload.single('file'), admin_controller_1.default.uploadExcel);
router.post('/v1/addEmployee', employee_controller_1.default.insertEmployee);
router.post('/v1/addEmployementDetails', employee_controller_1.default.insertEmploymentDetails);
router.post('/v1/add-Statutory-Info', employee_controller_1.default.insertEmployeeStatutoryInfo);
router.post('/v1/add-Employee-Family-Info', employee_controller_1.default.insertEmployeeFamilyInfo);
router.post('/v1/addExitDetails', employee_controller_1.default.insertExitDetails);
router.post('/v1/current-address', employee_controller_1.default.insertEmployeeCurrentAddress);
router.post('/v1/permanent-address', employee_controller_1.default.insertEmployeePermanentAddress);
router.post('/v1/bulk-data-entry', employee_controller_1.default.insertBulkEmployees);
router.post('/v1/employee', cookie_parser_middleware_1.verifyAccessToken, 
// checkMyRole,
employee_controller_1.default.viewAllEmployeesEverything);
router.post('/v1/log-out', cookie_parser_middleware_1.verifyAccessToken, employee_login_controller_1.default.LogOut);
router.post('/v1/forgot-pwd', employee_login_controller_1.default.ForgotPwd);
router.post('/v1/add-pwd', employee_login_controller_1.default.PasswordGeneratorHey);
router.post('/v1/change-pwd', employee_login_controller_1.default.ChangePwd);
router.post('/v1/change-new-pwd', employee_login_controller_1.default.PasswordGeneratorHey);
router.post('/v1/leave-balance', 
// verifyAccessToken,
leave_controller_1.default.createLeaveBalance);
router.get('/v1/leave-balance', 
// verifyAccessToken,
leave_controller_1.default.getLeaveBalances);
router.post('/v1/leave-request', 
// verifyAccessToken,
leave_controller_1.default.createLeaveRequest);
router.get('/v1/leave-request', 
// verifyAccessToken,
leave_controller_1.default.getLeaveRequests);
router.post('/v1/add-leaves-all', 
// verifyAccessToken,
leave_controller_1.default.addLeaves);
// test apis here 🤡
router.post('/v1/test-api', employee_login_controller_1.default.getRole);
// add test apis here only
exports.default = router;
//# sourceMappingURL=index.js.map