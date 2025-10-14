import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LeaveModalComponent } from './leave-modal/leave-modal.component';
import { FormsModule } from '@angular/forms';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IndexeddbEmployeesService } from 'src/app/services/indexeddb-employees.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, LeaveModalComponent]
})
export class AdminComponent implements OnInit {
  selectedFile: File | null = null;
  showModal = false;
  leaveData: any = null;
  EmployeeselectedFile: File | null = null;
  holidays: any;
  candidatelist: any;
  Employeelist: any;
  candidates: any;
  public allCandidates: any[] = [];
  public pagedCandidates: any[] = [];
  public pageSize: number = 10;
  public currentPage: number = 1;
  public totalPages: number = 1;
  isLoading: boolean = true;
  constructor(private http: HttpClient,
    private indexeddbService: IndexeddbEmployeesService,
    private candidateService: CandidateService) { }

  async ngOnInit() {
    this.isLoading = true;
    const savedData = localStorage.getItem('leaveData');
    if (savedData) {
      this.leaveData = JSON.parse(savedData);
    }
    const storedEmployees = await this.indexeddbService.getEmployees();
    if (storedEmployees) {
      this.Employeelist = storedEmployees;
      console.log('Loaded employees from IndexedDB:', storedEmployees);
    }
    this.candidateService.getHolidaysList('id').subscribe((res: any) => {
      this.holidays = res.data;
      console.log(res);
    });
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
    formData.append("file", this.EmployeeselectedFile);
    this.candidateService.postcurrentEmployees(formData).subscribe({
      next: async (res) => {
        this.Employeelist = res.data;
        console.log(this.Employeelist);
        await this.indexeddbService.saveEmployees(this.Employeelist);
        console.log('Employees saved to IndexedDB ✅');
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        alert("Upload failed!");
      }
    });
  }

  Upload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.http.post("http://30.0.0.78:3562/holidays/public_holidays", formData).subscribe({
      next: (res) => {
        console.log(res);
        alert("Upload successful!");

      },
      error: (err) => {
        console.error(err);
        alert("Upload failed!");
      }
    });
    this.http.post("http://30.0.0.78:3562/upload-holidays", formData)
      .subscribe((res: any) => console.log(res), (err: any) => console.error(err));
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
  async deleteEmployees() {
    await this.indexeddbService.clearEmployees();
    this.Employeelist = [];
    alert('Employees cleared!');
  }
}
