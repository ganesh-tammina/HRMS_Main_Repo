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

  // ✅ HOLIDAY VARIABLES
  holidays: any[] = [];
  upcomingHolidays: any[] = [];
  selectedDate: Date = new Date();

  selectedFile: File | null = null;
  showModal = false;
  leaveData: any = null;
  EmployeeselectedFile: File | null = null;

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

    // ✅ GET HOLIDAYS FROM BACKEND
    this.candidateService.getHolidaysList('id').subscribe((res: any) => {
      this.holidays = res.data || [];
      this.filterUpcomingHolidays();
      console.log('All holidays:', this.holidays);
    });

    // ✅ GET EMPLOYEES
    this.candidateService.getEmployeeById('').subscribe((data: any) => {
      this.allCandidates = data.candidates || [];
      this.calculatePagination();
      this.updatePagedCandidates();
    });
    this.getwfhreq()
  }

  // ✅ WHEN DATE PICKED FROM CALENDAR
  onDateChange(event: any) {
    this.selectedDate = new Date(event.detail.value);
    this.filterUpcomingHolidays();
  }

  // ✅ FILTER UPCOMING HOLIDAYS
  filterUpcomingHolidays() {
    if (!this.holidays || this.holidays.length === 0) {
      this.upcomingHolidays = [];
      return;
    }

    const today = new Date(this.selectedDate);
    today.setHours(0, 0, 0, 0);

    this.upcomingHolidays = this.holidays
      .filter((h: any) => {
        const holidayDate = new Date(h.holiday_date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
      })
      .sort((a: any, b: any) => {
        return (
          new Date(a.holiday_date).getTime() -
          new Date(b.holiday_date).getTime()
        );
      })
      .slice(0, 5);   // show only next 5

    console.log('Upcoming Holidays:', this.upcomingHolidays);
  }

  // ✅ Pagination
  calculatePagination() {
    this.totalPages = Math.ceil(this.allCandidates.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  updatePagedCandidates() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedCandidates = this.allCandidates.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedCandidates();
    }
  }

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
  }

  EmployeesUpload() {
    if (!this.EmployeeselectedFile) return;

    const formData = new FormData();
    formData.append('file', this.EmployeeselectedFile);

    this.http.post(`https://${environment.apiURL}/api/v1/parse-excel`, formData)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.employee_list_length = res.rowCount;
            localStorage.setItem('employee_list', JSON.stringify(res.data));
          }
          alert('Upload successful!');
        },
        error: () => alert('Upload failed!')
      });
  }

  save_EMployees() {
    const employeeData = localStorage.getItem('employee_list');
    if (!employeeData) {
      alert('No employee data to save.');
      return;
    }

    this.http.post(
      `https://${environment.apiURL}/api/v1/bulk-data-entry`,
      JSON.parse(employeeData)
    ).subscribe();
  }

  Upload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post(`https://localhost:3562/api/v1/holidays/upload`, formData)
      .subscribe({
        next: () => alert('Holiday upload successful!'),
        error: () => alert('Upload failed!')
      });
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
