import { pool } from "../config/database";

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

export interface EmployeeRole {
  employee_id: number;
  role_id: number;
  assigned_by?: string | null;
  assigned_source?: 'manual' | 'job_title' | 'system';
  assigned_at?: Date;
}

export class RoleService {
  static async createDepartment(data: Department): Promise<Department> {
    const [result]: any = await pool.execute(
      'INSERT INTO departments (department_name, description) VALUES (?, ?)',
      [data.department_name, data.description || null]
    );
    return { department_id: result.insertId, ...data };
  }

  static async getAllDepartments(): Promise<Department[]> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM departments ORDER BY department_name ASC'
    );
    return rows;
  }

  static async getDepartmentById(id: number): Promise<Department | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM departments WHERE department_id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async updateDepartment(
    id: number,
    data: Department
  ): Promise<boolean> {
    const [result]: any = await pool.execute(
      'UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?',
      [data.department_name, data.description || null, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteDepartment(id: number): Promise<boolean> {
    const [result]: any = await pool.execute(
      'DELETE FROM departments WHERE department_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async createRole(data: Role): Promise<Role> {
    const [result]: any = await pool.execute(
      'INSERT INTO roles (role_name, description) VALUES (?, ?)',
      [data.role_name, data.description || null]
    );
    return { role_id: result.insertId, ...data };
  }

  static async getAllRoles(): Promise<Role[]> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM roles ORDER BY role_name ASC'
    );
    return rows;
  }

  static async getRoleById(id: number): Promise<Role | null> {
    const [rows]: any = await pool.execute(
      'SELECT * FROM roles WHERE role_id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async updateRole(id: number, data: Role): Promise<boolean> {
    const [result]: any = await pool.execute(
      'UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?',
      [data.role_name, data.description || null, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteRole(id: number): Promise<boolean> {
    const [result]: any = await pool.execute(
      'DELETE FROM roles WHERE role_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async createJobTitle(data: JobTitle): Promise<JobTitle> {
    const [result]: any = await pool.execute(
      'INSERT INTO job_titles (job_title_name, department_id) VALUES (?, ?)',
      [data.job_title_name, data.department_id || null]
    );
    return { job_title_id: result.insertId, ...data };
  }

  static async getAllJobTitles(): Promise<any[]> {
    const [rows]: any = await pool.execute(
      `SELECT jt.*, d.department_name 
       FROM job_titles jt 
       LEFT JOIN departments d ON jt.department_id = d.department_id 
       ORDER BY jt.job_title_name ASC`
    );
    return rows;
  }

  static async getJobTitleById(id: number): Promise<any | null> {
    const [rows]: any = await pool.execute(
      `SELECT jt.*, d.department_name 
       FROM job_titles jt 
       LEFT JOIN departments d ON jt.department_id = d.department_id 
       WHERE jt.job_title_id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async updateJobTitle(id: number, data: JobTitle): Promise<boolean> {
    const [result]: any = await pool.execute(
      'UPDATE job_titles SET job_title_name = ?, department_id = ? WHERE job_title_id = ?',
      [data.job_title_name, data.department_id || null, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteJobTitle(id: number): Promise<boolean> {
    const [result]: any = await pool.execute(
      'DELETE FROM job_titles WHERE job_title_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async assignRoleToJobTitle(data: JobTitleRole): Promise<JobTitleRole> {
    await pool.execute(
      'INSERT INTO job_title_roles (job_title_id, role_id) VALUES (?, ?)',
      [data.job_title_id, data.role_id]
    );
    return data;
  }

  static async getRolesByJobTitle(job_title_id: number): Promise<Role[]> {
    const [rows]: any = await pool.execute(
      `SELECT r.* FROM job_title_roles jtr 
       INNER JOIN roles r ON jtr.role_id = r.role_id 
       WHERE jtr.job_title_id = ?`,
      [job_title_id]
    );
    return rows;
  }

  static async getJobTitlesByRole(role_id: number): Promise<JobTitle[]> {
    const [rows]: any = await pool.execute(
      `SELECT jt.* FROM job_title_roles jtr 
       INNER JOIN job_titles jt ON jtr.job_title_id = jt.job_title_id 
       WHERE jtr.role_id = ?`,
      [role_id]
    );
    return rows;
  }

  static async removeRoleFromJobTitle(
    job_title_id: number,
    role_id: number
  ): Promise<boolean> {
    const [result]: any = await pool.execute(
      'DELETE FROM job_title_roles WHERE job_title_id = ? AND role_id = ?',
      [job_title_id, role_id]
    );
    return result.affectedRows > 0;
  }

  static async assignRoleToEmployee(data: EmployeeRole): Promise<EmployeeRole> {
    await pool.execute(
      `INSERT INTO employee_roles (employee_id, role_id, assigned_by, assigned_source)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_source = VALUES(assigned_source)`,
      [
        data.employee_id,
        data.role_id,
        data.assigned_by || null,
        data.assigned_source || 'manual',
      ]
    );
    return data;
  }

  static async getRolesByEmployee(employee_id: number): Promise<any[]> {
    const [rows]: any = await pool.execute(
      `SELECT r.*, er.assigned_by, er.assigned_source, er.assigned_at 
       FROM employee_roles er 
       INNER JOIN roles r ON er.role_id = r.role_id 
       WHERE er.employee_id = ? 
       ORDER BY r.role_name ASC`,
      [employee_id]
    );
    return rows;
  }

  static async getEmployeesByRole(role_id: number): Promise<any[]> {
    const [rows]: any = await pool.execute(
      `SELECT e.*, er.assigned_by, er.assigned_source, er.assigned_at 
       FROM employee_roles er 
       INNER JOIN employees e ON er.employee_id = e.employee_id 
       WHERE er.role_id = ?`,
      [role_id]
    );
    return rows;
  }

  static async removeRoleFromEmployee(
    employee_id: number,
    role_id: number
  ): Promise<boolean> {
    const [result]: any = await pool.execute(
      'DELETE FROM employee_roles WHERE employee_id = ? AND role_id = ?',
      [employee_id, role_id]
    );
    return result.affectedRows > 0;
  }
}
