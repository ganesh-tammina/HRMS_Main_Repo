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
  isEditMode = false;
  selectedProjectId: number | null = null;

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
      status: ['active', Validators.required],
      description: [''],
      project_manager_id: ['', Validators.required]
    });
  }

  openCreateForm(): void {
    this.isEditMode = false;
    this.selectedProjectId = null;
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.isEditMode = false;
    this.selectedProjectId = null;
    this.projectForm.reset({ status: 'active' });
  }

  submit(): void {
    if (this.projectForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submitting = true;

    const operation = this.isEditMode && this.selectedProjectId
      ? this.projectService.updateProject(this.selectedProjectId, this.projectForm.value)
      : this.projectService.createProject(this.projectForm.value);

    const successMessage = this.isEditMode ? 'Project updated successfully' : 'Project created successfully';
    const errorMessage = this.isEditMode ? 'Failed to update project' : 'Failed to create project';

    operation.subscribe({
      next: () => {
        this.showToast(successMessage, 'success');
        this.submitting = false;
        this.showCreateForm = false;
        this.isEditMode = false;
        this.selectedProjectId = null;
        this.projectForm.reset({ status: 'active' });
        this.getProjects();
      },
      error: () => {
        this.showToast(errorMessage, 'danger');
        this.submitting = false;
      }
    });
  }

  getProjects(): void {
    this.loadingProjects = true;

    this.projectService.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res.projects || res || [];
        this.loadingProjects = false;
      },
      error: () => {
        this.showToast('Failed to load projects', 'danger');
        this.loadingProjects = false;
      }
    });
  }

  openEditForm(project: Project): void {
    this.isEditMode = true;
    this.selectedProjectId = project.id || null;
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
    this.showCreateForm = true;
  }

  navigateToDetails(project: Project): void {
    if (project.id) {
      this.router.navigate(['/project-details', project.id]);
    }
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
  adminManagement() {
    this.router.navigate(['./admin']);
  }
}
