import { Request, Response } from 'express';
import { EmployeesInterface, promised } from '../interface/employee-interface';
import { PoolConnection } from 'mysql2/promise';
interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    statusCode: number;
}
export default class Employeeservices implements EmployeesInterface {
    viewEmployement_details(req: Request, res: Response): Promise<any>;
    addEmployees(req: Request, res: Response, standalone?: boolean): Promise<promised>;
    addAddress(req: Request, res: Response, addType: 'Current' | 'Permanent', standalone?: boolean): Promise<promised>;
    addEmployement_details(req: Request, res: Response, standalone?: boolean): Promise<promised>;
    addExitdetails(req: Request, res: Response, standalone?: boolean): Promise<promised>;
    addFamilyInfo(req: Request, res: Response, standalone?: boolean): Promise<promised>;
    addStatutoryInfo(req: Request, res: Response, standalone?: boolean): Promise<promised>;
    viewEmployees(req: Request, res: Response): Promise<ApiResponse>;
    editEmployees(req: Request, res: Response): Promise<ApiResponse>;
    deleteEmployees(req: Request, res: Response): Promise<ApiResponse>;
    viewAddress(req: Request, res: Response): Promise<ApiResponse>;
    editAddress(req: Request, res: Response): Promise<ApiResponse>;
    deleteAddress(req: Request, res: Response): Promise<ApiResponse>;
    editEmployement_details(req: Request, res: Response): Promise<ApiResponse>;
    deleteEmployement_details(req: Request, res: Response): Promise<ApiResponse>;
    viewExitdetails(req: Request, res: Response): Promise<ApiResponse>;
    editExitdetails(req: Request, res: Response): Promise<ApiResponse>;
    deleteExitdetails(req: Request, res: Response): Promise<ApiResponse>;
    viewFamilyInfo(req: Request, res: Response): Promise<ApiResponse>;
    editFamilyInfo(req: Request, res: Response): Promise<ApiResponse>;
    deleteFamilyInfo(req: Request, res: Response): Promise<ApiResponse>;
    viewStatutoryInfo(req: Request, res: Response): Promise<ApiResponse>;
    editStatutoryInfo(req: Request, res: Response): Promise<ApiResponse>;
    deleteStatutoryInfo(req: Request, res: Response): Promise<ApiResponse>;
    formatDate(dateInput: any): string | null;
    parseIntSafe(value: any): number | null;
    parseNoticePeriod(text: any): number | null;
    resolveReportingManager(value: any): string | null;
    truncateZip(zip: any): string | null;
    hasData(obj: any, keys: string[]): boolean;
    getEmployeeIdByNumber(conn: PoolConnection, employeeNumber: string): Promise<number | null>;
}
export {};
//# sourceMappingURL=employee-service.d.ts.map