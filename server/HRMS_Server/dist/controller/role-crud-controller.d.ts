import { Request, Response } from 'express';
export declare class DatabaseController {
    static createDepartment(req: Request, res: Response): Promise<void>;
    static getDepartments(req: Request, res: Response): Promise<void>;
    static getDepartmentById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateDepartment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteDepartment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createRole(req: Request, res: Response): Promise<void>;
    static getRoles(req: Request, res: Response): Promise<void>;
    static getRoleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createJobTitle(req: Request, res: Response): Promise<void>;
    static getJobTitles(req: Request, res: Response): Promise<void>;
    static getJobTitleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateJobTitle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteJobTitle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static assignRoleToJobTitle(req: Request, res: Response): Promise<void>;
    static getRolesByJobTitle(req: Request, res: Response): Promise<void>;
    static getJobTitlesByRole(req: Request, res: Response): Promise<void>;
    static removeRoleFromJobTitle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static assignRoleToDepartment(req: Request, res: Response): Promise<void>;
    static getRolesByDepartment(req: Request, res: Response): Promise<void>;
    static getDepartmentsByRole(req: Request, res: Response): Promise<void>;
    static removeRoleFromDepartment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllDepartmentRoles(req: Request, res: Response): Promise<void>;
    static assignRoleToEmployee(req: Request, res: Response): Promise<void>;
    static getRolesByEmployee(req: Request, res: Response): Promise<void>;
    static getEmployeesByRole(req: Request, res: Response): Promise<void>;
    static removeRoleFromEmployee(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=role-crud-controller.d.ts.map