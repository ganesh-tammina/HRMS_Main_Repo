import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import { ProjectService } from 'src/app/services/project.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {

  projectId!: number;

  project: any = null;
  shifts: any[] = [];
  assignments: any[] = [];

  shiftForm!: FormGroup;
  assignForm!: FormGroup;

  loading = true;
  errorMessage = '';

  showShiftModal = false;
  showAssignModal = false;
  submittingShift = false;
  submittingAssignment = false;

  allEmployees: any[] = [];
  filteredEmployees: any[] = [];
  searchTerm = '';
  selectedEmployee: any = null;
  shiftIcons: any = {
    day: '../../../../assets/Icons/day-blue.svg',
    night: '../../../../assets/Icons/night-blue.svg',
    evening: '../../../../assets/Icons/evening-blue.svg'
  };

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.loading = false;
      this.errorMessage = 'Project ID missing';
      return;
    }

    this.projectId = +idParam;

    this.initForms();
    this.loadAll();
    this.loadEmployees();
  }

  /* ================= FORMS ================= */
  initForms() {
    this.shiftForm = this.fb.group({
      shift_type: ['day', Validators.required],
      shift_name: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      timezone: ['UTC', Validators.required]
    });

    this.assignForm = this.fb.group({
      employee_id: ['', Validators.required],
      role_in_project: ['', Validators.required],
      allocation_percentage: [100, Validators.required],
      shift_id: ['', Validators.required],
      assignment_start_date: ['', Validators.required],
      assignment_end_date: ['', Validators.required]
    });
  }

  /* ================= LOAD ALL ================= */
  loadAll() {
    this.loading = true;

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (res: any) => {
        // Handle nested response structure
        if (res.success && res.project) {
          this.project = res.project;
          this.shifts = res.project.shifts || [];
          this.assignments = res.project.assignments || [];
        } else if (Array.isArray(res)) {
          this.project = res[0];
        } else {
          this.project = res;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load project';
        this.loading = false;
      }
    });
  }

  /* ================= MODAL CONTROLS ================= */
  openShiftModal(): void {
    this.showShiftModal = true;
  }

  closeShiftModal(): void {
    this.showShiftModal = false;
    this.shiftForm.reset({ shift_type: 'day', timezone: 'UTC' });
  }

  openAssignModal(): void {
    this.showAssignModal = true;
    this.searchTerm = '';
    this.filteredEmployees = [];
    this.selectedEmployee = null;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.searchTerm = '';
    this.filteredEmployees = [];
    this.selectedEmployee = null;
    this.assignForm.reset({ allocation_percentage: 100 });
  }

  /* ================= EMPLOYEE SEARCH ================= */
  loadEmployees(): void {
    console.log('Loading employees...');

    this.employeeService.getAllEmployees().subscribe({
      next: (response: any) => {
        console.log('Employee response:', response);
        // Handle different response formats
        if (Array.isArray(response)) {
          this.allEmployees = response;
        } else if (response.employees) {
          this.allEmployees = response.employees;
        } else if (response.data) {
          this.allEmployees = response.data;
        } else {
          this.allEmployees = [];
        }
        console.log('Loaded employees:', this.allEmployees.length);
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        // Fallback: try search endpoint
        this.employeeService.searchEmployees('').subscribe({
          next: (employees) => {
            console.log('Loaded via search:', employees);
            this.allEmployees = employees || [];
          },
          error: (err2) => {
            console.error('Error with search fallback:', err2);
          }
        });
      }
    });
  }

  onEmployeeSearch(event: any) {
    const query = event.detail.value?.toLowerCase() || '';
    this.searchTerm = query;

    if (query.length < 2) {
      this.filteredEmployees = [];
      return;
    }

    this.filteredEmployees = this.allEmployees.filter(emp =>
      emp.FirstName?.toLowerCase().includes(query) ||
      emp.LastName?.toLowerCase().includes(query) ||
      emp.EmployeeNumber?.toLowerCase().includes(query) ||
      emp.WorkEmail?.toLowerCase().includes(query) ||
      `${emp.FirstName} ${emp.LastName}`.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results
  }

  selectEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.searchTerm = `${employee.FirstName} ${employee.LastName} (${employee.EmployeeNumber})`;
    this.assignForm.patchValue({ employee_id: employee.id });
    this.filteredEmployees = [];
  }

  clearEmployeeSelection() {
    this.selectedEmployee = null;
    this.searchTerm = '';
    this.assignForm.patchValue({ employee_id: '' });
    this.filteredEmployees = [];
  }

  /* ================= SHIFTS ================= */
  createShift() {
    if (this.shiftForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submittingShift = true;

    this.projectService
      .createProjectShift(this.projectId, this.shiftForm.value)
      .subscribe({
        next: () => {
          this.showToast('Shift created successfully', 'success');
          this.submittingShift = false;
          this.closeShiftModal();
          this.loadShifts();
        },
        error: () => {
          this.showToast('Shift creation failed', 'danger');
          this.submittingShift = false;
        }
      });
  }

  loadShifts() {
    this.projectService
      .getProjectShifts(this.projectId)
      .subscribe(res => (this.shifts = res || []));
  }

  /* ================= ASSIGN EMPLOYEE ================= */
  assignEmployee() {
    if (this.assignForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submittingAssignment = true;

    this.projectService
      .assignEmployee(this.projectId, this.assignForm.value)
      .subscribe({
        next: () => {
          this.showToast('Employee assigned successfully', 'success');
          this.submittingAssignment = false;
          this.closeAssignModal();
          this.loadAssignments();
        },
        error: () => {
          this.showToast('Assignment failed', 'danger');
          this.submittingAssignment = false;
        }
      });
  }

  loadAssignments() {
    this.projectService
      .getAssignments(this.projectId)
      .subscribe(res => (this.assignments = res || []));
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
  adminManagement() {
    this.router.navigate(['./admin']);
  }
  projectDeails() {
    this.router.navigate(['./CreateProject']);
  }
  
}