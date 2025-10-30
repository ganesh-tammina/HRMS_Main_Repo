import { Router } from 'express';
import { DatabaseController } from '../controller/role-crud-controller';

const rolecrud = Router();

rolecrud.post('/v1/departments', DatabaseController.createDepartment);
rolecrud.get('/v1/departments', DatabaseController.getDepartments);
rolecrud.get('/v1/departments/:id', DatabaseController.getDepartmentById);
rolecrud.put('/v1/departments/:id', DatabaseController.updateDepartment);
rolecrud.delete('/v1/departments/:id', DatabaseController.deleteDepartment);

rolecrud.post('/v1/roles', DatabaseController.createRole);
rolecrud.get('/v1/roles', DatabaseController.getRoles);
rolecrud.get('/v1/roles/:id', DatabaseController.getRoleById);
rolecrud.put('/v1/roles/:id', DatabaseController.updateRole);
rolecrud.delete('/v1/roles/:id', DatabaseController.deleteRole);

rolecrud.post('/v1/job-titles', DatabaseController.createJobTitle);
rolecrud.get('/v1/job-titles', DatabaseController.getJobTitles);
rolecrud.get('/v1/job-titles/:id', DatabaseController.getJobTitleById);
rolecrud.put('/v1/job-titles/:id', DatabaseController.updateJobTitle);
rolecrud.delete('/v1/job-titles/:id', DatabaseController.deleteJobTitle);

rolecrud.post('/v1/job-title-roles', DatabaseController.assignRoleToJobTitle);
rolecrud.get(
  '/v1/job-title-roles/job-title/:job_title_id',
  DatabaseController.getRolesByJobTitle
);
rolecrud.get(
  '/v1/job-title-roles/role/:role_id',
  DatabaseController.getJobTitlesByRole
);
rolecrud.delete('/v1/job-title-roles', DatabaseController.removeRoleFromJobTitle);

rolecrud.post('/v1/employee-roles', DatabaseController.assignRoleToEmployee);
rolecrud.get(
  '/v1/employee-roles/employee/:employee_id',
  DatabaseController.getRolesByEmployee
);
rolecrud.get(
  '/v1/employee-roles/role/:role_id',
  DatabaseController.getEmployeesByRole
);
rolecrud.delete('/v1/employee-roles', DatabaseController.removeRoleFromEmployee);

export default rolecrud;
