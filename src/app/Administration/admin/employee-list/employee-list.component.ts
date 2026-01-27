import { WeeklyOffPolicyService, WeeklyOffPolicy } from 'src/app/services/weekly-off-policy.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadService } from '../../../services/uploads.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { IonicModule, IonModal } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShiftPolicyService, ShiftPolicy } from 'src/app/services/shift-policy.service';
import { AttendancePolicyService, AttendancePolicy } from 'src/app/services/attendance-policy.service';
import { LeavePlanService, LeavePlan } from 'src/app/services/leave-plan.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class EmployeeListComponent implements OnInit {
  userRole: string | null = null;
  isHR: boolean = false;
  searchTerm: string = '';
  selectedEmployee: any = null;
  updateData: any = {
    reporting_manager_id: null,
    leave_plan_id: null,
    shift_policy_id: null,
    attendance_policy_id: null,
    PayGradeId: null
  };
  shiftPolicies: ShiftPolicy[] = [];
  attendancePolicies: AttendancePolicy[] = [];
  leavePlans: LeavePlan[] = [];
  weeklyOffPolicies: WeeklyOffPolicy[] = [];
  /* ================= EMPLOYEES ================= */
  allCandidates: any[] = [];
  pagedCandidates: any[] = [];

  pageSize = 5;        // 5 records per page
  currentPage = 1;
  totalPages = 1;

  EmployeeselectedFile: File | null = null;
  isUploading = false; // Loading state for upload
  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private uploadService: UploadService,
    private employeeService: EmployeeService,
    private shiftPolicyService: ShiftPolicyService,
    private attendancePolicyService: AttendancePolicyService,
    private leavePlanService: LeavePlanService,
    private weeklyOffPolicyService: WeeklyOffPolicyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userRole = (localStorage.getItem('role') || '').toLowerCase();
    this.isHR = this.userRole === 'hr';
    this.loadEmployees(); // ✅ initial load
    this.loadShiftPolicies();
    this.loadAttendancePolicies();
    this.loadLeavePlans();
    this.loadWeeklyOffPolicies();
  }

  loadWeeklyOffPolicies() {
    this.weeklyOffPolicyService.getWeeklyOffPolicies().subscribe((policies: WeeklyOffPolicy[]) => {
      this.weeklyOffPolicies = policies || [];
    });
  }

  loadLeavePlans() {
    this.leavePlanService.getLeavePlans().subscribe((plans: LeavePlan[]) => {
      this.leavePlans = plans || [];
    });
  }

  loadAttendancePolicies() {
    this.attendancePolicyService.getAttendancePolicies().subscribe((policies: AttendancePolicy[]) => {
      this.attendancePolicies = policies || [];
    });
  }

  loadShiftPolicies() {
    this.shiftPolicyService.getShiftPolicies().subscribe((policies: ShiftPolicy[]) => {
      this.shiftPolicies = policies || [];
    });
  }
  /* ================= LOAD EMPLOYEES (REUSABLE) ================= */
  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe((res: any[]) => {
      this.allCandidates = res || [];
      this.sortEmployeesById(); // Sort employees by ID
      this.applySearch();
      // reset pagination
      this.currentPage = 1;
      this.calculatePagination();
      this.updatePagedCandidates();
      console.log('Employees loaded and sorted by ID:', this.allCandidates);
    });
  }

  /* ================= SORT EMPLOYEES BY ID ================= */
  sortEmployeesById() {
    this.allCandidates.sort((a, b) => a.id - b.id);
    this.updatePagedCandidates();
  }

  applySearch() {
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      this.allCandidates = this.allCandidates.filter(emp =>
        (emp.FullName || '').toLowerCase().includes(term) ||
        (emp.id + '').includes(term) ||
        (emp.WorkEmail || '').toLowerCase().includes(term)
      );
    }
  }

  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.updateData = {
      reporting_manager_id: emp.reporting_manager_id || null,
      leave_plan_id: emp.leave_plan_id || null,
      shift_policy_id: emp.shift_policy_id || null,
      attendance_policy_id: emp.attendance_policy_id || null,
      weekly_off_policy_id: emp.weekly_off_policy_id || null,
      PayGradeId: emp.PayGradeId || null
    };
  }

  updateEmployeeProfile() {
    if (!this.selectedEmployee) return;
    this.employeeService.updateEmployeeProfile(this.selectedEmployee.id, this.updateData).subscribe({
      next: () => {
        alert('Employee profile updated successfully');
        this.selectedEmployee = null;
        this.loadEmployees();
      },
      error: () => {
        alert('Failed to update employee profile');
      }
    });
  }

  /* ================= FILE SELECT ================= */
  EmployeeSelected(event: any) {
    this.EmployeeselectedFile = event.target.files[0];
  }

  /* ================= UPLOAD EMPLOYEES ================= */
  EmployeesUpload() {
    if (!this.EmployeeselectedFile) {
      alert('Please select an Excel file');
      return;
    }

    this.isUploading = true; // Show loading spinner
    this.modal.dismiss(); // Immediately close modal

    this.uploadService.uploadEmployees(this.EmployeeselectedFile).subscribe({
      next: () => {
        this.isUploading = false; // Hide loading spinner
        alert('Employees uploaded successfully');
        this.EmployeeselectedFile = null;
        // ✅ IMMEDIATE REFRESH (NO PAGE RELOAD)
        this.loadEmployees();
      },
      error: () => {
        this.isUploading = false; // Hide loading spinner
        alert('Employee upload failed');
      }
    });
  }

  /* ================= PAGINATION ================= */
  calculatePagination() {
    this.totalPages = Math.ceil(this.allCandidates.length / this.pageSize);
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }
  }

  updatePagedCandidates() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedCandidates = this.allCandidates.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedCandidates();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedCandidates();
    }
  }
  adminManagement() {
    this.router.navigate(['/admin']);
  }
}
