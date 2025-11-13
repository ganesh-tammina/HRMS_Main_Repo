import { Request, Response } from 'express';
import Employeeservices from '../services/employee-service';
import BulkEmployeeInsertService from '../services/bulk-employee-insert-service';

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
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
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
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesAddressWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesExitDetailsWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesFamilyInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async viewEmployeesStatutoryInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }

  // edit with id
  static async editEmployeeWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeDetailsWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeAddressWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeExitdetailsWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeFamilyInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async editEmployeeStatutoryInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }

  // detele employees with id
  static async deleteEmployeeWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeAddressWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeExitDetailsWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeFamilyInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeStautoryInfoWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  static async deleteEmployeeDetailsWithID(req: Request, res: Response) {
    const result = await BulkEmployeeInsertService.bulkInsertEmployees(
      req,
      res
    );
    return res.status(result.statusCode).json(result);
  }
  public static async uploadAndUpsert(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { employee_id } = req.body;
      const file = req.file;

      if (!employee_id || !file) {
        res.status(400).json({
          success: false,
          message: 'Missing employee_id or image file',
        });
        return;
      }

      // Construct dynamic link for the uploaded file
      const imageLink = `/api/v1/image/${file.filename}`;

      const success = await Employeeservices.upsertProfilePic(
        employee_id,
        imageLink
      );

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Profile picture uploaded successfully',
          image: imageLink,
        });
      } else {
        res
          .status(500)
          .json({ success: false, message: 'Database operation failed' });
      }
    } catch (error) {
      console.error('Error in uploadAndUpsert:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal Server Error' });
    }
  }
  public static async serveImage(req: Request, res: Response): Promise<void> {
    const imageName = req.params.image_name;
    res.sendFile(`${process.cwd()}/uploads/${imageName}`);
  }
}
