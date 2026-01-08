import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonModal } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UploadService } from '../../services/uploads.service';
import { CandidateService } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class AdminComponent implements OnInit {

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
    private employeeService: CandidateService,
    private router: Router
  ) { }

  /* ================= INIT ================= */
  ngOnInit() {
    this.loadEmployees(); // ✅ initial load
  }

  /* ================= LOAD EMPLOYEES (REUSABLE) ================= */
  loadEmployees() {
    this.employeeService.getAllEmployeeDeatils().subscribe((res: any[]) => {
      this.allCandidates = res || [];

      // reset pagination
      this.currentPage = 1;
      this.calculatePagination();
      this.updatePagedCandidates();

      console.log('Employees loaded:', this.allCandidates);
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

    this.uploadService.uploadEmployees(this.EmployeeselectedFile).subscribe({
      next: () => {
        this.isUploading = false; // Hide loading spinner
        alert('Employees uploaded successfully');

        this.modal.dismiss();
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

  dep() {
    this.router.navigate(['/admin-department']);
  }
  adminleaves() {
    this.router.navigate(['/admin-leaves']);
  }
  adminsetup() {
    this.router.navigate(['/admin-setup']);
  }
  projectsetup() {
    this.router.navigate(['/CreateProject']);
  }
}
