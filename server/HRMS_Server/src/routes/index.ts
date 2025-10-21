import { Router } from "express";
import MailController from "../controller/mail-sender-controller/mailer-controller";
import { Request, Response } from "express";
import { readFile } from "fs/promises";
import multer from "multer";
import { ExcelProcessorService } from "../services/excel-processer-service";
import EmployeeLoginController from "../controller/employee-login-controller";
import AdminController from "../controller/admin-controller";
import { checkIfIamEmployeeAtAll, checkIfIamValidEmployee, checkWhoAmI } from "../middlewares/cookie-parser-middleware";
import EmployeeController from "../controller/employee-controller";
import LoginService from "../services/employee-login-service";

const upload = multer({ dest: "uploads/" });

const router = Router();
router.post("/v1/send-email", MailController.mailsender);
router.post("/v1/check-email",checkWhoAmI, EmployeeLoginController.EmailCheck);
router.post("/v1/gen-password", checkIfIamValidEmployee, EmployeeLoginController.PasswordGeneratorHey)
router.post("/v1/login", checkIfIamEmployeeAtAll, EmployeeLoginController.Login)
router.post("/v1/addEmployee", EmployeeController.insertEmployee);
router.post("/v1/addEmployementDetails", EmployeeController.insertEmploymentDetails);
router.post("/v1/add-Statutory-Info", EmployeeController.insertEmployeeStatutoryInfo);
router.post("/v1/add-Employee-Family-Info", EmployeeController.insertEmployeeFamilyInfo);
router.post("/v1/parse-excel", upload.single("file"),AdminController.uploadExcel);
router.post("/v1/addExitDetails", EmployeeController.insertExitDetails);
router.post("/v1/current-address", EmployeeController.insertEmployeeCurrentAddress);
router.post("/v1/permanent-address", EmployeeController.insertEmployeePermanentAddress);
router.post("/v1/bulk-data-entry", EmployeeController.insertBulkEmployees);
router.get("/v1/employee", EmployeeController.viewAllEmployeesEverything)

// test apis here 🤡
router.get("/test", async (req, res) => {
  const file = await readFile("./src/db.json", "utf8");
  const json = JSON.parse(file);
  res.json({
    employees: json.employees.length,
    addresses: json.addresses.length,
    family_info: json.family_info.length,
    employment_details: json.employment_details.length,
    statutory_info: json.statutory_info.length,
    exit_details: json.exit_details.length,
  });
});

export default router;
