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
  // public allCandidates: any[] = [];
  // public pagedEmployees: any[] = [];
  // public pageSize: number = 10;
  // public currentPage: number = 1;
  // public totalPages: number = 1;
  pageSize: number = 5;   // show 10 employees per page
  currentPage: number = 1;
  totalPages: number = 1;
  pagedEmployees: any[] = [];


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
    this.updatePagination();
    if (storedEmployees) {
      this.Employeelist = storedEmployees;
      this.updatePagination();
      this.isLoading = false;
      console.log('Loaded employees from IndexedDB:', storedEmployees);
    }
    this.candidateService.getHolidaysList('id').subscribe((res: any) => {
      this.holidays = res.data;
      console.log(res);
    });
  }

  //pagination for employees list
  calculatePagination() {
    if (!this.Employeelist) return;
    this.totalPages = Math.ceil(this.Employeelist.length / this.pageSize);
    // Ensure currentPage doesn't exceed totalPages after data is loaded

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedEmployees = this.Employeelist.slice(startIndex, endIndex);


  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  updatePagination() {
    // const startIndex = (this.currentPage - 1) * this.pageSize;
    // const endIndex = startIndex + this.pageSize;
    // Slice the full array to get only the items for the current page
    // this.pagedCandidates = this.allCandidates.slice(startIndex, endIndex);
    if (!this.Employeelist) return;

    this.totalPages = Math.ceil(this.Employeelist.length / this.pageSize);

    // Adjust currentPage if out of range
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedEmployees = this.Employeelist.slice(startIndex, endIndex);
  }

  // changePage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //     this.updatePagination();
  //   }
  // }
  // Helper methods for easy navigation




  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  EmployeeSelected(event: any) {
    this.EmployeeselectedFile = event.target.files[0];
    console.log(this.EmployeeselectedFile);
  }
  async EmployeesUpload() {
    if (!this.EmployeeselectedFile) return;

    const formData = new FormData();
    formData.append("file", this.EmployeeselectedFile);

    // Upload the file first to parse Excel
    this.candidateService.postcurrentEmployees(formData).subscribe({
      next: async (res: any) => {
        this.Employeelist = res.data;
        console.log('Parsed employees:', this.Employeelist);

        // Save to IndexedDB
        await this.indexeddbService.saveEmployees(this.Employeelist);
        console.log('Employees saved to IndexedDB ✅');

        // Upload in smaller batches
        this.candidateService.postEmployeesInBatches(this.Employeelist)
          .subscribe({
            next: (res) => console.log('✅ All batches uploaded successfully', res),
            error: (err) => console.error('❌ Batch upload failed', err)
          });

        this.updatePagination();
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
  sendDataDB() {
    this.candidateService.postEmployeesInBatches(this.Employeelist).subscribe((res) => console.log(res));
  }
}
