import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/services/project.service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class CreateProjectComponent implements OnInit {

  projectForm!: FormGroup;
  submitting = false;

  /** ✅ Project List */
  projects: Project[] = [];
  loadingProjects = false;
  showCreateForm = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getProjects();   // 👈 Load projects on page load
  }

  /* ============================
     INIT FORM
  ============================ */
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

  /* ============================
     CREATE PROJECT
  ============================ */
  submit(): void {
    if (this.projectForm.invalid) {
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submitting = true;

    this.projectService.createProject(this.projectForm.value).subscribe({
      next: () => {
        this.showToast('Project created successfully', 'success');
        this.projectForm.reset({ status: 'Active' });
        this.submitting = false;

        this.getProjects(); // 🔄 Refresh list after create
      },
      error: (err) => {
        console.error('Create project error:', err);
        this.showToast('Failed to create project', 'danger');
        this.submitting = false;
      }
    });
  }

  /* ============================
     GET PROJECTS
  ============================ */
  getProjects(): void {
    this.loadingProjects = true;

    this.projectService.getProjects().subscribe({
      next: (res) => {
        console.log('Projects:', res);
        this.projects = res || [];
        this.loadingProjects = false;
      },
      error: (err) => {
        console.error('Get projects error:', err);
        this.showToast('Failed to load projects', 'danger');
        this.loadingProjects = false;
      }
    });
  }

  /* ============================
     TOAST
  ============================ */
  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
  openCreateForm(): void {
    this.showCreateForm = true;
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.projectForm.reset({ status: 'Active' });
  }
}
