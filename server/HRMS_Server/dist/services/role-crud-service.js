"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const database_1 = require("../config/database");
class RoleService {
    static async createDepartment(data) {
        const [result] = await database_1.pool.execute('INSERT INTO departments (department_name, description) VALUES (?, ?)', [data.department_name, data.description || null]);
        return { department_id: result.insertId, ...data };
    }
    static async getAllDepartments() {
        const [rows] = await database_1.pool.execute('SELECT * FROM departments ORDER BY department_name ASC');
        return rows;
    }
    static async getDepartmentById(id) {
        const [rows] = await database_1.pool.execute('SELECT * FROM departments WHERE department_id = ?', [id]);
        return rows[0] || null;
    }
    static async updateDepartment(id, data) {
        const [result] = await database_1.pool.execute('UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?', [data.department_name, data.description || null, id]);
        return result.affectedRows > 0;
    }
    static async deleteDepartment(id) {
        const [result] = await database_1.pool.execute('DELETE FROM departments WHERE department_id = ?', [id]);
        return result.affectedRows > 0;
    }
    static async createRole(data) {
        const [result] = await database_1.pool.execute('INSERT INTO roles (role_name, description) VALUES (?, ?)', [data.role_name, data.description || null]);
        return { role_id: result.insertId, ...data };
    }
    static async getAllRoles() {
        const [rows] = await database_1.pool.execute('SELECT * FROM roles ORDER BY role_name ASC');
        return rows;
    }
    static async getRoleById(id) {
        const [rows] = await database_1.pool.execute('SELECT * FROM roles WHERE role_id = ?', [id]);
        return rows[0] || null;
    }
    static async updateRole(id, data) {
        const [result] = await database_1.pool.execute('UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?', [data.role_name, data.description || null, id]);
        return result.affectedRows > 0;
    }
    static async deleteRole(id) {
        const [result] = await database_1.pool.execute('DELETE FROM roles WHERE role_id = ?', [id]);
        return result.affectedRows > 0;
    }
    static async createJobTitle(data) {
        const [result] = await database_1.pool.execute('INSERT INTO job_titles (job_title_name, department_id) VALUES (?, ?)', [data.job_title_name, data.department_id || null]);
        return { job_title_id: result.insertId, ...data };
    }
    static async getAllJobTitles() {
        const [rows] = await database_1.pool.execute(`SELECT jt.*, d.department_name 
       FROM job_titles jt 
       LEFT JOIN departments d ON jt.department_id = d.department_id 
       ORDER BY jt.job_title_name ASC`);
        return rows;
    }
    static async getJobTitleById(id) {
        const [rows] = await database_1.pool.execute(`SELECT jt.*, d.department_name 
       FROM job_titles jt 
       LEFT JOIN departments d ON jt.department_id = d.department_id 
       WHERE jt.job_title_id = ?`, [id]);
        return rows[0] || null;
    }
    static async updateJobTitle(id, data) {
        const [result] = await database_1.pool.execute('UPDATE job_titles SET job_title_name = ?, department_id = ? WHERE job_title_id = ?', [data.job_title_name, data.department_id || null, id]);
        return result.affectedRows > 0;
    }
    static async deleteJobTitle(id) {
        const [result] = await database_1.pool.execute('DELETE FROM job_titles WHERE job_title_id = ?', [id]);
        return result.affectedRows > 0;
    }
    static async assignRoleToJobTitle(data) {
        await database_1.pool.execute('INSERT INTO job_title_roles (job_title_id, role_id) VALUES (?, ?)', [data.job_title_id, data.role_id]);
        return data;
    }
    static async getRolesByJobTitle(job_title_id) {
        const [rows] = await database_1.pool.execute(`SELECT r.* FROM job_title_roles jtr 
       INNER JOIN roles r ON jtr.role_id = r.role_id 
       WHERE jtr.job_title_id = ?`, [job_title_id]);
        return rows;
    }
    static async getJobTitlesByRole(role_id) {
        const [rows] = await database_1.pool.execute(`SELECT jt.* FROM job_title_roles jtr 
       INNER JOIN job_titles jt ON jtr.job_title_id = jt.job_title_id 
       WHERE jtr.role_id = ?`, [role_id]);
        return rows;
    }
    static async removeRoleFromJobTitle(job_title_id, role_id) {
        const [result] = await database_1.pool.execute('DELETE FROM job_title_roles WHERE job_title_id = ? AND role_id = ?', [job_title_id, role_id]);
        return result.affectedRows > 0;
    }
    // Dept
    static async assignRoleToDepartment(data) {
        await database_1.pool.execute(`INSERT INTO department_role (department_id, role_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), role_id = VALUES(role_id)`, [data.department_id, data.role_id]);
        return data;
    }
    static async getRolesByDepartment(department_id) {
        const [rows] = await database_1.pool.execute(`SELECT r.* 
     FROM department_role dr
     INNER JOIN roles r ON dr.role_id = r.role_id
     WHERE dr.department_id = ?`, [department_id]);
        return rows;
    }
    static async getDepartmentsByRole(role_id) {
        const [rows] = await database_1.pool.execute(`SELECT d.* 
     FROM department_role dr
     INNER JOIN departments d ON dr.department_id = d.department_id
     WHERE dr.role_id = ?`, [role_id]);
        return rows;
    }
    static async removeRoleFromDepartment(department_id, role_id) {
        const [result] = await database_1.pool.execute(`DELETE FROM department_role WHERE department_id = ? AND role_id = ?`, [department_id, role_id]);
        return result.affectedRows > 0;
    }
    static async getAllDepartmentRoles() {
        const [rows] = await database_1.pool.execute(`SELECT dr.*, d.department_name, r.role_name 
     FROM department_role dr
     INNER JOIN departments d ON dr.department_id = d.department_id
     INNER JOIN roles r ON dr.role_id = r.role_id
     ORDER BY d.department_name, r.role_name`);
        return rows;
    }
    // Dept
    static async assignRoleToEmployee(data) {
        await database_1.pool.execute(`INSERT INTO employee_roles (employee_id, role_id, assigned_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by)`, [
            data.employee_id,
            data.role_id,
            data.assigned_by || null,
        ]);
        return data;
    }
    static async getRolesByEmployee(employee_id) {
        const [rows] = await database_1.pool.execute(`SELECT r.*, er.assigned_by, er.assigned_source, er.assigned_at 
       FROM employee_roles er 
       INNER JOIN roles r ON er.role_id = r.role_id 
       WHERE er.employee_id = ? 
       ORDER BY r.role_name ASC`, [employee_id]);
        return rows;
    }
    static async getEmployeesByRole(role_id) {
        const [rows] = await database_1.pool.execute(`SELECT e.*, er.assigned_by, er.assigned_source, er.assigned_at 
       FROM employee_roles er 
       INNER JOIN employees e ON er.employee_id = e.employee_id 
       WHERE er.role_id = ?`, [role_id]);
        return rows;
    }
    static async removeRoleFromEmployee(employee_id, role_id) {
        const [result] = await database_1.pool.execute('DELETE FROM employee_roles WHERE employee_id = ? AND role_id = ?', [employee_id, role_id]);
        return result.affectedRows > 0;
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=role-crud-service.js.map