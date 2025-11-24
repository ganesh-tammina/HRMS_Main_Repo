import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Department {
  department_id?: number;
  department_name: string;
  description?: string | null;
  created_at?: string;
}

export interface Role {
  role_id?: number;
  role_name: string;
  description?: string | null;
  created_at?: string;
}

export interface JobTitle {
  job_title_id?: number;
  job_title_name: string;
  department_id?: number | null;
  department_name?: string | null;
  created_at?: string;
}
export type TimeFormat = `${number | string}:${number | string}:${
  | number
  | string}`;
export interface Shift {
  shift_id?: number;
  shift_name: string;
  check_in: TimeFormat;
  check_out: TimeFormat;
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
  assigned_at?: string;
}

// week offs
export type ofDay =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';
export interface WeekOff {
  week_off_policy_id?: number;
  week_off_policy_name: string;
  week_off_days: ofDay[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `https://${environment.apiURL}/api/v1`;

  constructor(private http: HttpClient) {}

  // Departments
  getDepartments(): Observable<any> {
    return this.http.get(`${this.base}/departments`);
  }
  createDepartment(payload: Partial<Department>) {
    return this.http.post(`${this.base}/departments`, payload);
  }
  updateDepartment(id: number, payload: Partial<Department>) {
    return this.http.put(`${this.base}/departments/${id}`, payload);
  }
  deleteDepartment(id: number) {
    return this.http.delete(`${this.base}/departments/${id}`);
  }
  getDepartmentById(id: number) {
    return this.http.get(`${this.base}/departments/${id}`);
  }

  // Roles
  getRoles() {
    return this.http.get(`${this.base}/roles`);
  }
  createRole(payload: Partial<Role>) {
    return this.http.post(`${this.base}/roles`, payload);
  }
  updateRole(id: number, payload: Partial<Role>) {
    return this.http.put(`${this.base}/roles/${id}`, payload);
  }
  deleteRole(id: number) {
    return this.http.delete(`${this.base}/roles/${id}`);
  }
  getRoleById(id: number) {
    return this.http.get(`${this.base}/roles/${id}`);
  }

  // Job Titles
  getJobTitles() {
    return this.http.get(`${this.base}/job-titles`);
  }
  createJobTitle(payload: Partial<JobTitle>) {
    return this.http.post(`${this.base}/job-titles`, payload);
  }
  updateJobTitle(id: number, payload: Partial<JobTitle>) {
    return this.http.put(`${this.base}/job-titles/${id}`, payload);
  }
  deleteJobTitle(id: number) {
    return this.http.delete(`${this.base}/job-titles/${id}`);
  }
  getJobTitleById(id: number) {
    return this.http.get(`${this.base}/job-titles/${id}`);
  }

  // JobTitleRoles
  assignRoleToJobTitle(payload: JobTitleRole) {
    return this.http.post(`${this.base}/job-title-roles`, payload);
  }
  getRolesByJobTitle(job_title_id: number) {
    return this.http.get(
      `${this.base}/job-title-roles/job-title/${job_title_id}`
    );
  }
  getJobTitlesByRole(role_id: number) {
    return this.http.get(`${this.base}/job-title-roles/role/${role_id}`);
  }
  removeRoleFromJobTitle(payload: JobTitleRole) {
    // API expects DELETE with body
    return this.http.request('delete', `${this.base}/job-title-roles`, {
      body: payload,
    });
  }

  // DepartmentRole (department-roles)
  assignRoleToDepartment(payload: DepartmentRole) {
    return this.http.post(`${this.base}/department-roles`, payload);
  }
  getRolesByDepartment(department_id: number) {
    return this.http.get(
      `${this.base}/department-roles/department/${department_id}`
    );
  }
  getDepartmentsByRole(role_id: number) {
    return this.http.get(`${this.base}/department-roles/role/${role_id}`);
  }
  removeRoleFromDepartment(payload: DepartmentRole) {
    return this.http.request('delete', `${this.base}/department-roles`, {
      body: payload,
    });
  }
  getAllDepartmentRoles() {
    return this.http.get(`${this.base}/department-roles`);
  }

  // EmployeeRoles
  assignRoleToEmployee(payload: EmployeeRole) {
    return this.http.post(`${this.base}/employee-roles`, payload);
  }
  getRolesByEmployee(employee_id: number) {
    return this.http.get(`${this.base}/employee-roles/employee/${employee_id}`);
  }
  getEmployeesByRole(role_id: number) {
    return this.http.get(`${this.base}/employee-roles/role/${role_id}`);
  }
  removeRoleFromEmployee(payload: { employee_id: number; role_id: number }) {
    return this.http.request('delete', `${this.base}/employee-roles`, {
      body: payload,
    });
  }

  // shifts
  upsertShift(payload: Partial<Shift>) {
    return this.http.post(`${this.base}/shift-policy`, payload);
  }
  getShifts() {
    return this.http.get(`${this.base}/get-all-shift-policy`);
  }
  deleteShift(id: number) {
    return this.http.delete(`${this.base}/delete-shift-policy/${id}`);
  }

  // weekoff

  insertWeekOffPolicy(payload: WeekOff) {
    return this.http.post(`${this.base}/weekoff`, payload);
  }
  updateWeekOffPolicy(id: number, payload: WeekOff) {
    return this.http.put(`${this.base}/weekoff/${id}`, payload);
  }
  getWeekOffPolicies() {
    return this.http.get<WeekOff[]>(`${this.base}/weekoff`);
  }
  deleteWeekOffPolicy(id: number) {
    return this.http.delete(`${this.base}/weekoff/${id}`);
  }
}
