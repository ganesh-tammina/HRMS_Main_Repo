"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employee_service_1 = __importDefault(require("../services/employee-service"));
const bulk_employee_insert_service_1 = __importDefault(require("../services/bulk-employee-insert-service"));
const employeeService = new employee_service_1.default();
class EmployeeController {
    static async insertEmployee(req, res) {
        const result = await employeeService.addEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async insertEmployeeCurrentAddress(req, res) {
        const addType = 'Current';
        const result = await employeeService.addAddress(req, res, addType);
        return res.status(result.statusCode).json(result);
    }
    static async insertEmployeePermanentAddress(req, res) {
        const addType = 'Permanent';
        const result = await employeeService.addAddress(req, res, addType);
        return res.status(result.statusCode).json(result);
    }
    static async insertEmploymentDetails(req, res) {
        const result = await employeeService.addEmployement_details(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async insertEmployeeStatutoryInfo(req, res) {
        const result = await employeeService.addStatutoryInfo(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async insertEmployeeFamilyInfo(req, res) {
        const result = await employeeService.addFamilyInfo(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async insertExitDetails(req, res) {
        const result = await employeeService.addExitdetails(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async insertBulkEmployees(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    // uninplemented methods
    //
    //
    // /////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    static async viewAllEmployeesEverything(req, res) {
        const result = await employeeService.viewEmployement_details(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async viewEmployeesWithIDEverything(req, res) {
        const result = await employeeService.viewEmployement_details(req, res);
        return res.status(result.statusCode).json(result);
    }
    // view with id
    static async viewEmployeesDetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async viewEmployeesAddressWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async viewEmployeesExitDetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async viewEmployeesFamilyInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async viewEmployeesStatutoryInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    // edit with id
    static async editEmployeeWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async editEmployeeDetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async editEmployeeAddressWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async editEmployeeExitdetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async editEmployeeFamilyInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async editEmployeeStatutoryInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    // detele employees with id
    static async deleteEmployeeWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async deleteEmployeeAddressWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async deleteEmployeeExitDetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async deleteEmployeeFamilyInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async deleteEmployeeStautoryInfoWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
    static async deleteEmployeeDetailsWithID(req, res) {
        const result = await bulk_employee_insert_service_1.default.bulkInsertEmployees(req, res);
        return res.status(result.statusCode).json(result);
    }
}
exports.default = EmployeeController;
//# sourceMappingURL=employee-controller.js.map