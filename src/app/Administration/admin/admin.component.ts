import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonModal } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UploadService } from '../../services/uploads.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class AdminComponent implements OnInit {

  // ================= EMPLOYEES =================
  allCandidates: any[] = [];
  pagedCandidates: any[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  EmployeeselectedFile: File | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private uploadService: UploadService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.uploadService.getAllEmployeeDeatils().subscribe((res: any) => {
      console.log('All Employees:', res);
    })
  }


  // ================= FILE SELECT =================
  EmployeeSelected(event: any) {
    this.EmployeeselectedFile = event.target.files[0];
  }

  // ================= UPLOAD EMPLOYEES =================
  EmployeesUpload() {
    if (!this.EmployeeselectedFile) {
      alert('Please select an Excel file');
      return;
    }

    this.uploadService.uploadEmployees(this.EmployeeselectedFile).subscribe({
      next: () => {
        alert('Employees uploaded successfully');
        this.modal.dismiss();
        this.EmployeeselectedFile = null;
      },
      error: () => {
        alert('Employee upload failed');
      }
    });
  }

  // ================= PAGINATION =================
  calculatePagination() {
    this.totalPages = Math.ceil(this.allCandidates.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
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
}
