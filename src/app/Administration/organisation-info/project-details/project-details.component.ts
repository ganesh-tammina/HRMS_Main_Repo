import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {

  projectId!: number;

  project: any = null;
  shifts: any[] = [];
  assignments: any[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.loading = false;
      this.errorMessage = 'Project ID missing';
      return;
    }

    this.projectId = +idParam;
    this.loadAll();
  }

  loadAll() {
    this.loading = true;

    /* ================= PROJECT ================= */
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (res: any) => {
        console.log('Project API response 👉', res);

        // 🔥 HANDLE ARRAY OR OBJECT
        this.project = Array.isArray(res) ? res[0] : res;

        this.loading = false;
      },
      error: (err) => {
        console.error('Project API error ❌', err);
        this.errorMessage = 'Failed to load project';
        this.loading = false;
      }
    });

    /* ================= SHIFTS ================= */
    this.projectService.getProjectShifts(this.projectId).subscribe({
      next: (res: any[]) => {
        this.shifts = res || [];
      },
      error: () => {
        this.shifts = [];
      }
    });

    /* ================= ASSIGNMENTS ================= */
    this.projectService.getAssignments(this.projectId).subscribe({
      next: (res: any[]) => {
        this.assignments = res || [];
      },
      error: () => {
        this.assignments = [];
      }
    });
  }
}
