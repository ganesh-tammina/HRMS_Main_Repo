import { Request, Response } from "express";

export interface promised {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {} | string | any;
  error?: {} | string;
}
export interface EmployeesInterface {
  addEmployees(req: Request, res: Response): Promise<promised>;
  editEmployees(req: Request, res: Response): Promise<promised>;
  deleteEmployees(req: Request, res: Response): Promise<promised>;
  viewEmployees(req: Request, res: Response): Promise<promised>;
  addAddress(
    req: Request,
    res: Response,
    addType: "Current" | "Permanent"
  ): Promise<promised>;
  editAddress(req: Request, res: Response): Promise<promised>;
  deleteAddress(req: Request, res: Response): Promise<promised>;
  viewAddress(req: Request, res: Response): Promise<promised>;
  addEmployement_details(req: Request, res: Response): Promise<promised>;
  editEmployement_details(req: Request, res: Response): Promise<promised>;
  deleteEmployement_details(req: Request, res: Response): Promise<promised>;
  viewEmployement_details(req: Request, res: Response): Promise<promised>;
  addExitdetails(req: Request, res: Response): Promise<promised>;
  viewExitdetails(req: Request, res: Response): Promise<promised>;
  deleteExitdetails(req: Request, res: Response): Promise<promised>;
  editExitdetails(req: Request, res: Response): Promise<promised>;
  addFamilyInfo(req: Request, res: Response): Promise<promised>;
  viewFamilyInfo(req: Request, res: Response): Promise<promised>;
  deleteFamilyInfo(req: Request, res: Response): Promise<promised>;
  editFamilyInfo(req: Request, res: Response): Promise<promised>;
  addStatutoryInfo(req: Request, res: Response): Promise<promised>;
  viewStatutoryInfo(req: Request, res: Response): Promise<promised>;
  deleteStatutoryInfo(req: Request, res: Response): Promise<promised>;
  editStatutoryInfo(req: Request, res: Response): Promise<promised>;
}
export interface LoginInterface {
  login(req: Request, res: Response): Promise<any>;
  emailCheck(req: Request, res: Response): Promise<any>;
}
