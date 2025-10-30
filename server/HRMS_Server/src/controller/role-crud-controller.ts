import { Request, Response } from 'express';
import { RoleService } from '../services/role-crud-service';

export class DatabaseController {
  static async createDepartment(req: Request, res: Response) {
    try {
      const data = await RoleService.createDepartment(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create department', error: (error as Error).message });
    }
  }

  static async getDepartments(req: Request, res: Response) {
    try {
      const data = await RoleService.getAllDepartments();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch departments', error: (error as Error).message });
    }
  }

  static async getDepartmentById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await RoleService.getDepartmentById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Department not found' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch department', error: (error as Error).message });
    }
  }

  static async updateDepartment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.updateDepartment(id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'Department not found' });
      res.json({ success: true, message: 'Department updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update department', error: (error as Error).message });
    }
  }

  static async deleteDepartment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.deleteDepartment(id);
      if (!success) return res.status(404).json({ success: false, message: 'Department not found' });
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete department', error: (error as Error).message });
    }
  }

  static async createRole(req: Request, res: Response) {
    try {
      const data = await RoleService.createRole(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create role', error: (error as Error).message });
    }
  }

  static async getRoles(req: Request, res: Response) {
    try {
      const data = await RoleService.getAllRoles();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch roles', error: (error as Error).message });
    }
  }

  static async getRoleById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await RoleService.getRoleById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Role not found' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch role', error: (error as Error).message });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.updateRole(id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'Role not found' });
      res.json({ success: true, message: 'Role updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update role', error: (error as Error).message });
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.deleteRole(id);
      if (!success) return res.status(404).json({ success: false, message: 'Role not found' });
      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete role', error: (error as Error).message });
    }
  }

  static async createJobTitle(req: Request, res: Response) {
    try {
      const data = await RoleService.createJobTitle(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create job title', error: (error as Error).message });
    }
  }

  static async getJobTitles(req: Request, res: Response) {
    try {
      const data = await RoleService.getAllJobTitles();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch job titles', error: (error as Error).message });
    }
  }

  static async getJobTitleById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await RoleService.getJobTitleById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Job title not found' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch job title', error: (error as Error).message });
    }
  }

  static async updateJobTitle(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.updateJobTitle(id, req.body);
      if (!success) return res.status(404).json({ success: false, message: 'Job title not found' });
      res.json({ success: true, message: 'Job title updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update job title', error: (error as Error).message });
    }
  }

  static async deleteJobTitle(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoleService.deleteJobTitle(id);
      if (!success) return res.status(404).json({ success: false, message: 'Job title not found' });
      res.json({ success: true, message: 'Job title deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete job title', error: (error as Error).message });
    }
  }

  static async assignRoleToJobTitle(req: Request, res: Response) {
    try {
      const data = await RoleService.assignRoleToJobTitle(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to assign role to job title', error: (error as Error).message });
    }
  }

  static async getRolesByJobTitle(req: Request, res: Response) {
    try {
      const id = Number(req.params.job_title_id);
      const data = await RoleService.getRolesByJobTitle(id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch roles by job title', error: (error as Error).message });
    }
  }

  static async getJobTitlesByRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.role_id);
      const data = await RoleService.getJobTitlesByRole(id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch job titles by role', error: (error as Error).message });
    }
  }

  static async removeRoleFromJobTitle(req: Request, res: Response) {
    try {
      const { job_title_id, role_id } = req.body;
      const success = await RoleService.removeRoleFromJobTitle(job_title_id, role_id);
      if (!success) return res.status(404).json({ success: false, message: 'Role not assigned to job title' });
      res.json({ success: true, message: 'Role removed from job title successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove role from job title', error: (error as Error).message });
    }
  }

  static async assignRoleToEmployee(req: Request, res: Response) {
    try {
      const data = await RoleService.assignRoleToEmployee(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to assign role to employee', error: (error as Error).message });
    }
  }

  static async getRolesByEmployee(req: Request, res: Response) {
    try {
      const id = Number(req.params.employee_id);
      const data = await RoleService.getRolesByEmployee(id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch roles by employee', error: (error as Error).message });
    }
  }

  static async getEmployeesByRole(req: Request, res: Response) {
    try {
      const id = Number(req.params.role_id);
      const data = await RoleService.getEmployeesByRole(id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch employees by role', error: (error as Error).message });
    }
  }

  static async removeRoleFromEmployee(req: Request, res: Response) {
    try {
      const { employee_id, role_id } = req.body;
      const success = await RoleService.removeRoleFromEmployee(employee_id, role_id);
      if (!success) return res.status(404).json({ success: false, message: 'Role not assigned to employee' });
      res.json({ success: true, message: 'Role removed from employee successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove role from employee', error: (error as Error).message });
    }
  }
}
