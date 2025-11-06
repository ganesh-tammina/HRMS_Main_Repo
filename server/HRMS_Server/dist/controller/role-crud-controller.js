"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseController = void 0;
const role_crud_service_1 = require("../services/role-crud-service");
class DatabaseController {
    static async createDepartment(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.createDepartment(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to create department',
                error: error.message,
            });
        }
    }
    static async getDepartments(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.getAllDepartments();
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch departments',
                error: error.message,
            });
        }
    }
    static async getDepartmentById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await role_crud_service_1.RoleService.getDepartmentById(id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, message: 'Department not found' });
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch department',
                error: error.message,
            });
        }
    }
    static async updateDepartment(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.updateDepartment(id, req.body);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Department not found' });
            res.json({ success: true, message: 'Department updated successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to update department',
                error: error.message,
            });
        }
    }
    static async deleteDepartment(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.deleteDepartment(id);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Department not found' });
            res.json({ success: true, message: 'Department deleted successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to delete department',
                error: error.message,
            });
        }
    }
    static async createRole(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.createRole(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to create role',
                error: error.message,
            });
        }
    }
    static async getRoles(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.getAllRoles();
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch roles',
                error: error.message,
            });
        }
    }
    static async getRoleById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await role_crud_service_1.RoleService.getRoleById(id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, message: 'Role not found' });
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch role',
                error: error.message,
            });
        }
    }
    static async updateRole(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.updateRole(id, req.body);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Role not found' });
            res.json({ success: true, message: 'Role updated successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to update role',
                error: error.message,
            });
        }
    }
    static async deleteRole(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.deleteRole(id);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Role not found' });
            res.json({ success: true, message: 'Role deleted successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to delete role',
                error: error.message,
            });
        }
    }
    static async createJobTitle(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.createJobTitle(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to create job title',
                error: error.message,
            });
        }
    }
    static async getJobTitles(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.getAllJobTitles();
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch job titles',
                error: error.message,
            });
        }
    }
    static async getJobTitleById(req, res) {
        try {
            const id = Number(req.params.id);
            const data = await role_crud_service_1.RoleService.getJobTitleById(id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, message: 'Job title not found' });
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch job title',
                error: error.message,
            });
        }
    }
    static async updateJobTitle(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.updateJobTitle(id, req.body);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Job title not found' });
            res.json({ success: true, message: 'Job title updated successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to update job title',
                error: error.message,
            });
        }
    }
    static async deleteJobTitle(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await role_crud_service_1.RoleService.deleteJobTitle(id);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Job title not found' });
            res.json({ success: true, message: 'Job title deleted successfully' });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to delete job title',
                error: error.message,
            });
        }
    }
    static async assignRoleToJobTitle(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.assignRoleToJobTitle(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to assign role to job title',
                error: error.message,
            });
        }
    }
    static async getRolesByJobTitle(req, res) {
        try {
            const id = Number(req.params.job_title_id);
            const data = await role_crud_service_1.RoleService.getRolesByJobTitle(id);
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch roles by job title',
                error: error.message,
            });
        }
    }
    static async getJobTitlesByRole(req, res) {
        try {
            const id = Number(req.params.role_id);
            const data = await role_crud_service_1.RoleService.getJobTitlesByRole(id);
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch job titles by role',
                error: error.message,
            });
        }
    }
    static async removeRoleFromJobTitle(req, res) {
        try {
            const { job_title_id, role_id } = req.body;
            const success = await role_crud_service_1.RoleService.removeRoleFromJobTitle(job_title_id, role_id);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Role not assigned to job title' });
            res.json({
                success: true,
                message: 'Role removed from job title successfully',
            });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to remove role from job title',
                error: error.message,
            });
        }
    }
    // dept
    static async assignRoleToDepartment(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.assignRoleToDepartment(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to assign role to department',
                error: error.message,
            });
        }
    }
    static async getRolesByDepartment(req, res) {
        try {
            const department_id = Number(req.params.department_id);
            const data = await role_crud_service_1.RoleService.getRolesByDepartment(department_id);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch roles by department',
                error: error.message,
            });
        }
    }
    static async getDepartmentsByRole(req, res) {
        try {
            const role_id = Number(req.params.role_id);
            const data = await role_crud_service_1.RoleService.getDepartmentsByRole(role_id);
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch departments by role',
                error: error.message,
            });
        }
    }
    static async removeRoleFromDepartment(req, res) {
        try {
            const { department_id, role_id } = req.body;
            const success = await role_crud_service_1.RoleService.removeRoleFromDepartment(department_id, role_id);
            if (!success)
                return res.status(404).json({
                    success: false,
                    message: 'Role not assigned to department',
                });
            res.json({
                success: true,
                message: 'Role removed from department successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to remove role from department',
                error: error.message,
            });
        }
    }
    static async getAllDepartmentRoles(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.getAllDepartmentRoles();
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch department-role mappings',
                error: error.message,
            });
        }
    }
    // dept
    static async assignRoleToEmployee(req, res) {
        try {
            const data = await role_crud_service_1.RoleService.assignRoleToEmployee(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to assign role to employee',
                error: error.message,
            });
        }
    }
    static async getRolesByEmployee(req, res) {
        try {
            const id = Number(req.params.employee_id);
            const data = await role_crud_service_1.RoleService.getRolesByEmployee(id);
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch roles by employee',
                error: error.message,
            });
        }
    }
    static async getEmployeesByRole(req, res) {
        try {
            const id = Number(req.params.role_id);
            const data = await role_crud_service_1.RoleService.getEmployeesByRole(id);
            res.json({ success: true, data });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to fetch employees by role',
                error: error.message,
            });
        }
    }
    static async removeRoleFromEmployee(req, res) {
        try {
            const { employee_id, role_id } = req.body;
            const success = await role_crud_service_1.RoleService.removeRoleFromEmployee(employee_id, role_id);
            if (!success)
                return res
                    .status(404)
                    .json({ success: false, message: 'Role not assigned to employee' });
            res.json({
                success: true,
                message: 'Role removed from employee successfully',
            });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: 'Failed to remove role from employee',
                error: error.message,
            });
        }
    }
}
exports.DatabaseController = DatabaseController;
//# sourceMappingURL=role-crud-controller.js.map