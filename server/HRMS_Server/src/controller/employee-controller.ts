import { Request, Response } from "express";
import Employeeservices from "../services/employee-service";

const employeeService = new Employeeservices();

export default class EmployeeController {
  static async insertEmployee(req: Request, res: Response) {
    const result = await employeeService.addEmployees(req, res);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeeCurrentAddress(req: Request, res: Response) {
    const addType = "Current";
    const result = await employeeService.addAddress(req, res, addType);
    return res.status(result.statusCode).json(result);
  }
  static async insertEmployeePermanentAddress(req: Request, res: Response) {
    const addType = "Permanent";
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
}
