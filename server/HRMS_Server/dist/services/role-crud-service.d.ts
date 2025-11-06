export interface Department {
    department_id?: number;
    department_name: string;
    description?: string | null;
    created_at?: Date;
}
export interface Role {
    role_id?: number;
    role_name: string;
    description?: string | null;
    created_at?: Date;
}
export interface JobTitle {
    job_title_id?: number;
    job_title_name: string;
    department_id?: number | null;
    created_at?: Date;
}
export interface JobTitleRole {
    job_title_id: number;
    role_id: number;
}
export interface DepartmentRole {
    department_id: number;
    role_id: number;
}
export interface EmployeeRole {
    employee_id: number;
    role_id: number;
    assigned_by?: string | null;
    assigned_source?: 'manual' | 'job_title' | 'system';
    assigned_at?: Date;
}
export declare class RoleService {
    static createDepartment(data: Department): Promise<Department>;
    static getAllDepartments(): Promise<Department[]>;
    static getDepartmentById(id: number): Promise<Department | null>;
    static updateDepartment(id: number, data: Department): Promise<boolean>;
    static deleteDepartment(id: number): Promise<boolean>;
    static createRole(data: Role): Promise<Role>;
    static getAllRoles(): Promise<Role[]>;
    static getRoleById(id: number): Promise<Role | null>;
    static updateRole(id: number, data: Role): Promise<boolean>;
    static deleteRole(id: number): Promise<boolean>;
    static createJobTitle(data: JobTitle): Promise<JobTitle>;
    static getAllJobTitles(): Promise<any[]>;
    static getJobTitleById(id: number): Promise<any | null>;
    static updateJobTitle(id: number, data: JobTitle): Promise<boolean>;
    static deleteJobTitle(id: number): Promise<boolean>;
    static assignRoleToJobTitle(data: JobTitleRole): Promise<JobTitleRole>;
    static getRolesByJobTitle(job_title_id: number): Promise<Role[]>;
    static getJobTitlesByRole(role_id: number): Promise<JobTitle[]>;
    static removeRoleFromJobTitle(job_title_id: number, role_id: number): Promise<boolean>;
    static assignRoleToDepartment(data: DepartmentRole): Promise<DepartmentRole>;
    static getRolesByDepartment(department_id: number): Promise<Role[]>;
    static getDepartmentsByRole(role_id: number): Promise<Department[]>;
    static removeRoleFromDepartment(department_id: number, role_id: number): Promise<boolean>;
    static getAllDepartmentRoles(): Promise<any[]>;
    static assignRoleToEmployee(data: EmployeeRole): Promise<EmployeeRole>;
    static getRolesByEmployee(employee_id: number): Promise<any[]>;
    static getEmployeesByRole(role_id: number): Promise<any[]>;
    static removeRoleFromEmployee(employee_id: number, role_id: number): Promise<boolean>;
}
//# sourceMappingURL=role-crud-service.d.ts.map