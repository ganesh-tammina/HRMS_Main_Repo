import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import {
  ProjectService,
  Project,
  ProjectShift
} from 'src/app/services/project.service';

@Component({
  selector: 'app-project-assign',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './project-assign.component.html',
})
export class ProjectAssignComponent implements OnInit {

  projects: Project[] = [];
  shifts: ProjectShift[] = [];
  assignments: any[] = [];

  selectedProjectId!: number;

  shiftForm!: FormGroup;
  assignForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.initForms();
  }

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

  /* =====================
     LOAD PROJECTS
  ===================== */
  loadProjects() {
    this.projectService.getProjects().subscribe(res => {
      this.projects = res || [];
    });
  }

  onProjectChange(projectId: number) {
    this.selectedProjectId = projectId;
    this.loadShifts();
    this.loadAssignments();
  }

  /* =====================
     SHIFTS
  ===================== */
  createShift() {
    if (this.shiftForm.invalid) return;

    this.projectService
      .createProjectShift(this.selectedProjectId, this.shiftForm.value)
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
      .getProjectShifts(this.selectedProjectId)
      .subscribe(res => (this.shifts = res || []));
  }

  /* =====================
     ASSIGN EMPLOYEE
  ===================== */
  assignEmployee() {
    if (this.assignForm.invalid) return;

    this.projectService
      .assignEmployee(this.selectedProjectId, this.assignForm.value)
      .subscribe({
        next: () => {
          this.showToast('Employee assigned', 'success');
          this.assignForm.reset();
          this.loadAssignments();
        },
        error: () => this.showToast('Assignment failed', 'danger')
      });
  }

  loadAssignments() {
    this.projectService
      .getAssignments(this.selectedProjectId)
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
