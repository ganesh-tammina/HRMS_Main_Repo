import { Request, Response } from 'express';
import Employeeservices from '../services/employee-service';

const employeeService = new Employeeservices();

export default class EmployeeController {
  static async insertEmployee(req: Request, res: Response) {
    const result = await employeeService.addEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeeCurrentAddress(req: Request, res: Response) {
    const addType = 'Current';
    const result = await employeeService.addAddress(req, res, addType);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeePermanentAddress(req: Request, res: Response) {
    const addType = 'Permanent';
    const result = await employeeService.addAddress(req, res, addType);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmploymentDetails(req: Request, res: Response) {
    const result = await employeeService.addEmployement_details(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeeStatutoryInfo(req: Request, res: Response) {
    const result = await employeeService.addStatutoryInfo(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeeFamilyInfo(req: Request, res: Response) {
    const result = await employeeService.addFamilyInfo(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertExitDetails(req: Request, res: Response) {
    const result = await employeeService.addExitdetails(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertBulkEmployees(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  // uninplemented methods
  //
  //
  // /////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  static async viewAllEmployeesEverything(req: Request, res: Response) {
    const result = await employeeService.viewEmployement_details(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesWithIDEverything(req: Request, res: Response) {
    const result = await employeeService.viewEmployement_details(req, res);
    return res.status(result.statusCode).json(result);
  }

  // view with id
  static async viewEmployeesDetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesAddressWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesExitDetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesFamilyInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesStatutoryInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }

  // edit with id
  static async editEmployeeWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeDetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeAddressWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeExitdetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeFamilyInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeStatutoryInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }

  // detele employees with id
  static async deleteEmployeeWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeAddressWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeExitDetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeFamilyInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeStautoryInfoWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeDetailsWithID(req: Request, res: Response) {
    const result = await Employeeservices.bulkInsertEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
}
