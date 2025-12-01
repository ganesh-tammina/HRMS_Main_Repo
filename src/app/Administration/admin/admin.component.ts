import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, IonModal } from '@ionic/angular';
import { LeaveModalComponent } from './leave-modal/leave-modal.component';
import { FormsModule } from '@angular/forms';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { environment } from 'src/environments/environment';
import { ShiftsComponent } from './shifts/shifts.component';
import { WeekoffsComponent } from '../weekoffs/weekoffs.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    LeaveModalComponent,
    ShiftsComponent,
    WeekoffsComponent,
  ],
})
export class AdminComponent implements OnInit {
  selectedFile: File | null = null;
  showModal = false;
  leaveData: any = null;
  EmployeeselectedFile: File | null = null;
  holidays: any;
  candidatelist: any;
  candidates: any;
  employee_list_length: number = 0;
  public allCandidates: any[] = [];
  public pagedCandidates: any[] = [];
  public pageSize: number = 10;
  public currentPage: number = 1;
  public totalPages: number = 1;

  @ViewChild(IonModal) modal!: IonModal;
  selectedFiles: FileList | null = null;

  isLoading: boolean = true;
  constructor(
    private http: HttpClient,
    private candidateService: CandidateService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    const savedData = localStorage.getItem('leaveData');
    if (savedData) {
      this.leaveData = JSON.parse(savedData);
    }
    this.candidateService.getHolidaysList('id').subscribe((res: any) => {
      this.holidays = res.data;
      console.log(res);
    });

    this.candidateService.getEmployeeById('').subscribe((data: any) => {
      // Assuming data.candidates is the full array of candidates
      this.allCandidates = data.candidates || [];
      this.calculatePagination();
      this.updatePagedCandidates();
      console.log('Candidates:', this.allCandidates);
    });
    this.getwfhreq()
  }

  //pagination for employees list
  calculatePagination() {
    this.totalPages = Math.ceil(this.allCandidates.length / this.pageSize);
    // Ensure currentPage doesn't exceed totalPages after data is loaded
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  updatePagedCandidates() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    // Slice the full array to get only the items for the current page
    this.pagedCandidates = this.allCandidates.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedCandidates();
    }
  }
  // Helper methods for easy navigation
  nextPage() {
    this.changePage(this.currentPage + 1);
  }

  prevPage() {
    this.changePage(this.currentPage - 1);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  EmployeeSelected(event: any) {
    this.EmployeeselectedFile = event.target.files[0];
    console.log(this.EmployeeselectedFile);
  }
  EmployeesUpload() {
    if (!this.EmployeeselectedFile) return;
    const formData = new FormData();
    formData.append('file', this.EmployeeselectedFile);
    this.http
      .post(`https://${environment.apiURL}/api/v1/parse-excel`, formData)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          alert('Upload successful!');

          if (res.success) {
            this.employee_list_length = res.rowCount;
            localStorage.setItem('employee_list', JSON.stringify(res.data));
          }
        },
        error: (err) => {
          console.error(err);
          alert('Upload failed!');
        },
      });
  }
  save_EMployees() {
    const employeeData = localStorage.getItem('employee_list');
    if (!employeeData) {
      alert('No employee data to save. Please upload a file first.');
      return;
    }
    this.http
      .post(
        `https://${environment.apiURL}/api/v1/bulk-data-entry`,
        JSON.parse(employeeData)
      )
      .subscribe({
        next: (res) => {
          console.log(res);
        },
      });
  }
  Upload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post(`https://${environment.apiURL}/holidays/public_holidays`, formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          alert('Upload successful!');
        },
        error: (err) => {
          console.error(err);
          alert('Upload failed!');
        },
      });
    this.http
      .post(`https://${environment.apiURL}/upload-holidays`, formData)
      .subscribe(
        (res: any) => console.log(res),
        (err: any) => console.error(err)
      );
  }
  openModal() {
    this.showModal = true;
  }

  handleSave(leaves: any) {
    this.leaveData = leaves;
    localStorage.setItem('leaveData', JSON.stringify(leaves));

    this.showModal = false;
  }

  handleClose() {
    this.showModal = false;
  }
  deleteLeaves() {
    this.leaveData = null;
    localStorage.removeItem('leaveData');
  }

  dep() {
    this.router.navigate(['/admin-department']);
  }
  getwfhreq() {
    this.candidateService.getAllWFHRequests().subscribe((res: any) => {
      console.log(res);
    });
  }
}
