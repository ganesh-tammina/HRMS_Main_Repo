import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

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

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastCtrl: ToastController
  ) {}

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
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.projectForm.reset({ status: 'Active' });
  }

  submit(): void {
    if (this.projectForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submitting = true;

    this.projectService.createProject(this.projectForm.value).subscribe({
      next: () => {
        this.showToast('Project created successfully', 'success');
        this.submitting = false;
        this.showCreateForm = false;
        this.projectForm.reset({ status: 'Active' });
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
}
