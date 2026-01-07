import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private toastCtrl: ToastController
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
        this.project = Array.isArray(res) ? res[0] : res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load project';
        this.loading = false;
      }
    });

    this.loadShifts();
    this.loadAssignments();
  }

  /* ================= SHIFTS ================= */
  createShift() {
    if (this.shiftForm.invalid) return;

    this.projectService
      .createProjectShift(this.projectId, this.shiftForm.value)
      .subscribe({
        next: () => {
          this.showToast('Shift created', 'success');
          this.shiftForm.reset({ shift_type: 'day', timezone: 'UTC' });
          this.loadShifts();
        },
        error: () => this.showToast('Shift creation failed', 'danger')
      });
  }

  loadShifts() {
    this.projectService
      .getProjectShifts(this.projectId)
      .subscribe(res => (this.shifts = res || []));
  }

  /* ================= ASSIGN EMPLOYEE ================= */
  assignEmployee() {
    if (this.assignForm.invalid) return;

    this.projectService
      .assignEmployee(this.projectId, this.assignForm.value)
      .subscribe({
        next: () => {
          this.showToast('Employee assigned', 'success');
          this.assignForm.reset({ allocation_percentage: 100 });
          this.loadAssignments();
        },
        error: () => this.showToast('Assignment failed', 'danger')
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
}