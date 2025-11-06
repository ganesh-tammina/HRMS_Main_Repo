"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_crud_controller_1 = require("../controller/role-crud-controller");
const rolecrud = (0, express_1.Router)();
// ===================== DEPARTMENT CRUD =====================
rolecrud.post('/v1/departments', role_crud_controller_1.DatabaseController.createDepartment);
rolecrud.get('/v1/departments', role_crud_controller_1.DatabaseController.getDepartments);
rolecrud.get('/v1/departments/:id', role_crud_controller_1.DatabaseController.getDepartmentById);
rolecrud.put('/v1/departments/:id', role_crud_controller_1.DatabaseController.updateDepartment);
rolecrud.delete('/v1/departments/:id', role_crud_controller_1.DatabaseController.deleteDepartment);
// ===================== ROLE CRUD =====================
rolecrud.post('/v1/roles', role_crud_controller_1.DatabaseController.createRole);
rolecrud.get('/v1/roles', role_crud_controller_1.DatabaseController.getRoles);
rolecrud.get('/v1/roles/:id', role_crud_controller_1.DatabaseController.getRoleById);
rolecrud.put('/v1/roles/:id', role_crud_controller_1.DatabaseController.updateRole);
rolecrud.delete('/v1/roles/:id', role_crud_controller_1.DatabaseController.deleteRole);
// ===================== JOB TITLE CRUD =====================
rolecrud.post('/v1/job-titles', role_crud_controller_1.DatabaseController.createJobTitle);
rolecrud.get('/v1/job-titles', role_crud_controller_1.DatabaseController.getJobTitles);
rolecrud.get('/v1/job-titles/:id', role_crud_controller_1.DatabaseController.getJobTitleById);
rolecrud.put('/v1/job-titles/:id', role_crud_controller_1.DatabaseController.updateJobTitle);
rolecrud.delete('/v1/job-titles/:id', role_crud_controller_1.DatabaseController.deleteJobTitle);
// ===================== JOB TITLE–ROLE MAPPING =====================
rolecrud.post('/v1/job-title-roles', role_crud_controller_1.DatabaseController.assignRoleToJobTitle);
rolecrud.get('/v1/job-title-roles/job-title/:job_title_id', role_crud_controller_1.DatabaseController.getRolesByJobTitle);
rolecrud.get('/v1/job-title-roles/role/:role_id', role_crud_controller_1.DatabaseController.getJobTitlesByRole);
rolecrud.delete('/v1/job-title-roles', role_crud_controller_1.DatabaseController.removeRoleFromJobTitle);
// ===================== DEPARTMENT–ROLE MAPPING =====================
rolecrud.post('/v1/department-roles', role_crud_controller_1.DatabaseController.assignRoleToDepartment);
rolecrud.get('/v1/department-roles', role_crud_controller_1.DatabaseController.getAllDepartmentRoles);
rolecrud.get('/v1/department-roles/department/:department_id', role_crud_controller_1.DatabaseController.getRolesByDepartment);
rolecrud.get('/v1/department-roles/role/:role_id', role_crud_controller_1.DatabaseController.getDepartmentsByRole);
rolecrud.delete('/v1/department-roles', role_crud_controller_1.DatabaseController.removeRoleFromDepartment);
// ===================== EMPLOYEE–ROLE MAPPING =====================
rolecrud.post('/v1/employee-roles', role_crud_controller_1.DatabaseController.assignRoleToEmployee);
rolecrud.get('/v1/employee-roles/employee/:employee_id', role_crud_controller_1.DatabaseController.getRolesByEmployee);
rolecrud.get('/v1/employee-roles/role/:role_id', role_crud_controller_1.DatabaseController.getEmployeesByRole);
rolecrud.delete('/v1/employee-roles', role_crud_controller_1.DatabaseController.removeRoleFromEmployee);
exports.default = rolecrud;
//# sourceMappingURL=role-crud-routes.js.map