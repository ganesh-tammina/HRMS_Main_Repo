import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { ProjectService, Project } from 'src/app/services/project.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CreateProjectComponent implements OnInit {

  projectForm!: FormGroup;
  submitting = false;

  projects: Project[] = [];
  loadingProjects = false;

  showCreateForm = false;

  // ✅ ADDED FOR EDIT
  isEditMode = false;
  editingProjectId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getProjects();
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      project_code: ['', Validators.required],
      project_name: ['', Validators.required],
      client_name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      status: ['Active', Validators.required],
      description: [''],
      project_manager_id: ['', Validators.required]
    });
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingProjectId = null;
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.projectForm.reset({ status: 'Active' });
    this.showCreateForm = false;
    this.submitting = false;
    this.isEditMode = false;
    this.editingProjectId = null;
  }

  // ✅ ADDED
  editProject(project: Project): void {
    this.isEditMode = true;
    this.editingProjectId = project.id!;
    this.showCreateForm = true;

    this.projectForm.patchValue({
      project_code: project.project_code,
      project_name: project.project_name,
      client_name: project.client_name,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      description: project.description,
      project_manager_id: project.project_manager_id
    });
  }

  submit(): void {
    if (this.projectForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submitting = true;

    // ✅ EDIT FLOW (PUT)
    if (this.isEditMode && this.editingProjectId) {
      this.projectService
        .updateProject(this.editingProjectId, {
          ...this.projectForm.value,
          status: this.projectForm.value.status.toLowerCase()
        })
        .subscribe({
          next: () => {
            this.showToast('Project updated successfully', 'success');
            this.cancelCreate();
            this.getProjects();
          },
          error: () => {
            this.showToast('Failed to update project', 'danger');
            this.submitting = false;
          }
        });
      return;
    }

    // ✅ EXISTING CREATE FLOW (UNCHANGED)
    this.projectService.createProject(this.projectForm.value).subscribe({
      next: () => {
        this.showToast('Project created successfully', 'success');
        this.cancelCreate();
        this.getProjects();
      },
      error: () => {
        this.showToast('Failed to create project', 'danger');
        this.submitting = false;
      }
    });
  }

  getProjects(): void {
    this.loadingProjects = true;

    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res || [];
        this.loadingProjects = false;
      },
      error: () => {
        this.showToast('Failed to load projects', 'danger');
        this.loadingProjects = false;
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  openProjectDetails(projectId: number) {
    this.router.navigate(['/project-details', projectId]);
  }
}
