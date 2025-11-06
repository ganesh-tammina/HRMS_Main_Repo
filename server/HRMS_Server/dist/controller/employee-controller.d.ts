import { Request, Response } from 'express';
export default class EmployeeController {
    static insertEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertEmployeeCurrentAddress(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertEmployeePermanentAddress(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertEmploymentDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertEmployeeStatutoryInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertEmployeeFamilyInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertExitDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static insertBulkEmployees(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewAllEmployeesEverything(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesWithIDEverything(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesDetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesAddressWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesExitDetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesFamilyInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static viewEmployeesStatutoryInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeDetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeAddressWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeExitdetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeFamilyInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static editEmployeeStatutoryInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeAddressWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeExitDetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeFamilyInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeStautoryInfoWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteEmployeeDetailsWithID(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=employee-controller.d.ts.map