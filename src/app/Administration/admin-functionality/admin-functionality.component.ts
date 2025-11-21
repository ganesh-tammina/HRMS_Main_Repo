import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AdminService, Department, DepartmentRole, EmployeeRole, JobTitle, JobTitleRole, Role } from 'src/app/services/admin-functionality/admin.service.service';

@Component({
  selector: 'app-admin-functionality',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './admin-functionality.component.html',
  styleUrls: ['./admin-functionality.component.scss']
})
export class AdminFunctionalityComponent implements OnInit {
  // lists
  departments: Department[] = [];
  roles: Role[] = [];
  jobTitles: JobTitle[] = [];

  // UI
  tab: 'departments' | 'roles' | 'jobtitles' | 'weekOffs' | 'assignments' = 'departments';
  loading = false;

  // department form model
  deptModel: Partial<Department> = { department_name: '', description: '' };
  editingDepartmentId: number | null = null;

  // role form model
  roleModel: Partial<Role> = { role_name: '', description: '' };
  editingRoleId: number | null = null;

  // job-title form model
  jobTitleModel: Partial<JobTitle> = { job_title_name: '', department_id: null };
  editingJobTitleId: number | null = null;

  // assignment models
  jobTitleRoleModel: JobTitleRole = { job_title_id: 0, role_id: 0 };
  departmentRoleModel: DepartmentRole = { department_id: 0, role_id: 0 };
  employeeRoleModel: EmployeeRole = { employee_id: 0, role_id: 0, assigned_by: 'admin', assigned_source: 'manual' };

  constructor(
    private api: AdminService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit(): void {
    this.loadAll();
  }

  private async toast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 1500 });
    await t.present();
  }

  loadAll() {
    this.loadDepartments();
    this.loadRoles();
    this.loadJobTitles();
  }

  // ---------------- Departments ----------------
  loadDepartments() {
    this.loading = true;
    this.api.getDepartments().pipe(finalize(() => this.loading = false)).subscribe({
      next: (res: any) => this.departments = res?.data || [],
      error: async () => { await this.toast('Failed loading departments'); }
    });
  }

  startEditDepartment(d: Department) {
    this.editingDepartmentId = d.department_id || null;
    this.deptModel = { ...d };
  }

  saveDepartment() {
    const payload = {
      department_name: (this.deptModel.department_name || '').trim(),
      description: this.deptModel.description || null
    };

    if (this.editingDepartmentId) {
      this.api.updateDepartment(this.editingDepartmentId, payload).subscribe({
        next: () => { this.toast('Department updated'); this.resetDeptForm(); this.loadDepartments(); },
        error: async () => this.toast('Failed to update department')
      });
    } else {
      this.api.createDepartment(payload).subscribe({
        next: () => { this.toast('Department created'); this.resetDeptForm(); this.loadDepartments(); },
        error: async () => this.toast('Failed to create department')
      });
    }
  }

  confirmDeleteDepartment(id?: number) {
    if (!id) return;
    this.alertCtrl.create({
      header: 'Delete department?',
      message: 'This will remove the department.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.deleteDepartment(id) }
      ]
    }).then(a => a.present());
  }

  deleteDepartment(id: number) {
    this.api.deleteDepartment(id).subscribe({
      next: () => { this.toast('Department deleted'); this.loadDepartments(); },
      error: async () => this.toast('Failed to delete department')
    });
  }

  resetDeptForm() {
    this.editingDepartmentId = null;
    this.deptModel = { department_name: '', description: '' };
  }

  // ---------------- Roles ----------------
  loadRoles() {
    this.api.getRoles().subscribe({
      next: (res: any) => this.roles = res?.data || [],
      error: async () => this.toast('Failed loading roles')
    });
  }

  startEditRole(r: Role) {
    this.editingRoleId = r.role_id || null;
    this.roleModel = { ...r };
  }

  saveRole() {
    const payload = { role_name: (this.roleModel.role_name || '').trim(), description: this.roleModel.description || null };
    if (this.editingRoleId) {
      this.api.updateRole(this.editingRoleId, payload).subscribe({ next: () => { this.toast('Role updated'); this.resetRoleForm(); this.loadRoles(); }, error: async () => this.toast('Failed to update role') });
    } else {
      this.api.createRole(payload).subscribe({ next: () => { this.toast('Role created'); this.resetRoleForm(); this.loadRoles(); }, error: async () => this.toast('Failed to create role') });
    }
  }

  confirmDeleteRole(id?: number) {
    if (!id) return;
    this.alertCtrl.create({
      header: 'Delete role?',
      message: 'This will remove the role.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.deleteRole(id) }
      ]
    }).then(a => a.present());
  }

  deleteRole(id: number) {
    this.api.deleteRole(id).subscribe({ next: () => { this.toast('Role deleted'); this.loadRoles(); }, error: async () => this.toast('Failed to delete role') });
  }

  resetRoleForm() { this.editingRoleId = null; this.roleModel = { role_name: '', description: '' }; }

  // ---------------- Job Titles ----------------
  loadJobTitles() {
    this.api.getJobTitles().subscribe({
      next: (res: any) => this.jobTitles = res?.data || [],
      error: async () => this.toast('Failed loading job titles')
    });
  }

  startEditJobTitle(j: JobTitle) {
    this.editingJobTitleId = j.job_title_id || null;
    this.jobTitleModel = { ...j };
  }

  saveJobTitle() {
    const payload = {
      job_title_name: (this.jobTitleModel.job_title_name || '').trim(),
      department_id: this.jobTitleModel.department_id || null
    };
    if (this.editingJobTitleId) {
      this.api.updateJobTitle(this.editingJobTitleId, payload).subscribe({ next: () => { this.toast('Job title updated'); this.resetJobTitleForm(); this.loadJobTitles(); }, error: async () => this.toast('Failed to update job title') });
    } else {
      this.api.createJobTitle(payload).subscribe({ next: () => { this.toast('Job title created'); this.resetJobTitleForm(); this.loadJobTitles(); }, error: async () => this.toast('Failed to create job title') });
    }
  }

  confirmDeleteJobTitle(id?: number) {
    if (!id) return;
    this.alertCtrl.create({
      header: 'Delete job title?',
      message: 'This will remove the job title.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.deleteJobTitle(id) }
      ]
    }).then(a => a.present());
  }

  deleteJobTitle(id: number) {
    this.api.deleteJobTitle(id).subscribe({ next: () => { this.toast('Job title deleted'); this.loadJobTitles(); }, error: async () => this.toast('Failed to delete job title') });
  }

  resetJobTitleForm() { this.editingJobTitleId = null; this.jobTitleModel = { job_title_name: '', department_id: null }; }

  // ---------------- Assignments ----------------
  assignRoleToJobTitle() {
    if (!this.jobTitleRoleModel.job_title_id || !this.jobTitleRoleModel.role_id) { this.toast('Provide job_title_id and role_id'); return; }
    this.api.assignRoleToJobTitle(this.jobTitleRoleModel).subscribe({ next: () => { this.toast('Role assigned to job title'); this.jobTitleRoleModel = { job_title_id: 0, role_id: 0 }; }, error: async () => this.toast('Failed to assign role to job title') });
  }

  removeRoleFromJobTitle() {
    this.api.removeRoleFromJobTitle(this.jobTitleRoleModel).subscribe({ next: () => { this.toast('Role removed from job title'); this.jobTitleRoleModel = { job_title_id: 0, role_id: 0 }; }, error: async () => this.toast('Failed to remove role from job title') });
  }

  assignRoleToDepartment() {
    if (!this.departmentRoleModel.department_id || !this.departmentRoleModel.role_id) { this.toast('Provide department_id and role_id'); return; }
    this.api.assignRoleToDepartment(this.departmentRoleModel).subscribe({ next: () => { this.toast('Role assigned to department'); this.departmentRoleModel = { department_id: 0, role_id: 0 }; }, error: async () => this.toast('Failed to assign role to department') });
  }

  removeRoleFromDepartment() {
    this.api.removeRoleFromDepartment(this.departmentRoleModel).subscribe({ next: () => { this.toast('Role removed from department'); this.departmentRoleModel = { department_id: 0, role_id: 0 }; }, error: async () => this.toast('Failed to remove role from department') });
  }

  assignRoleToEmployee() {
    if (!this.employeeRoleModel.employee_id || !this.employeeRoleModel.role_id) { this.toast('Provide employee_id and role_id'); return; }
    this.api.assignRoleToEmployee(this.employeeRoleModel).subscribe({ next: () => { this.toast('Role assigned to employee'); this.employeeRoleModel = { employee_id: 0, role_id: 0, assigned_by: 'admin', assigned_source: 'manual' }; }, error: async () => this.toast('Failed to assign role to employee') });
  }

  removeRoleFromEmployee() {
    this.api.removeRoleFromEmployee({ employee_id: this.employeeRoleModel.employee_id as number, role_id: this.employeeRoleModel.role_id as number }).subscribe({ next: () => { this.toast('Role removed from employee'); this.employeeRoleModel = { employee_id: 0, role_id: 0, assigned_by: 'admin', assigned_source: 'manual' }; }, error: async () => this.toast('Failed to remove role from employee') });
  }
}
