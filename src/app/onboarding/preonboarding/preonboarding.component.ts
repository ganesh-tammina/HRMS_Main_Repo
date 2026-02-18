import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { OnboardingMainheaderComponent } from '../onboarding-mainheader/onboarding-mainheader.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { Router } from '@angular/router';
import { CandiateCreateComponent } from '../candiate-create/candiate-create.component';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StartOnboardingComponent } from '../start-onboarding/start-onboarding.component';
import { HireEmployeesService } from 'src/app/services/hire-employees.service';
import { CandidateDetailsService } from 'src/app/services/candidate-details-service.service';

@Component({
  selector: 'app-preonboarding',
  templateUrl: './preonboarding.component.html',
  styleUrls: ['./preonboarding.component.scss'],
  standalone: true,
  imports: [
    OnboardingMainheaderComponent,
    CommonModule,
    IonicModule,
    HeaderComponent,
  ],
})
export class PreonboardingComponent implements OnInit {
  // 👇 All candidates loaded from service
  candidates: any[] = [];


  filterCandidates: any[] = [];
  BusinessunitList: string[] = [];
  selectedBusiness: string = '';
  JobTitleList: string[] = [];
  selectedJobTitle: string = '';
  DeptList: string[] = [];
  selectedDept: string = '';
  LocationList: string[] = [];
  selectedLocation: string = '';
  searchText: string = '';


  hiddenCandidates: number[] = [];
  @Input() currentStage: number = 1;

  constructor(
    private router: Router,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private candidateService: CandidateService,
    private hireEmployeeService: HireEmployeesService,
    private CandidatedetailsService: CandidateDetailsService
  ) { }

  ngOnInit() {
    // Subscribe to candidates from service
    // this.candidateService.candidates$.subscribe(data => {
    //   this.candidates = data;
    //   console.log('Candidates:', this.candidates);
    // });
    this.CandidatedetailsService.getCandidates().subscribe((data: any) => {
      console.log('Candidates:', data);
      this.candidates = data;
      this.filterCandidates = [...data.candidates];
      // job title list
      this.JobTitleList = this.candidates.map(c => c.JobTitle)
        .filter((value, index, self) => self.indexOf(value) === index);
      // Business unit List
      this.BusinessunitList = this.candidates.map(c => c.BusinessUnit)
        .filter((value, index, self) => self.indexOf(value) === index);
      //Department List
      this.DeptList = this.candidates.map(c => c.Department)
        .filter((value, index, self) => self.indexOf(value) === index);
      // Location List
      this.LocationList = this.candidates.map(c => c.JobLocation)
        .filter((value, index, self) => self.indexOf(value) === index);

      console.log('Candidates:', this.candidates);
      console.log('Jobtitle:', this.BusinessunitList);
    });
    this.hiddenCandidates = JSON.parse(
      sessionStorage.getItem('hiddenCandidates') || '[]'
    );
  }

  // Navigate to candidate create (non-modal)
  addCandidate() {
    this.router.navigate(['/CandiateCreate']);
  }

  // Start Pre-Onboarding for a selected candidate
  async startpreonboarding(candidate: any) {
    const modal = await this.modalCtrl.create({
      component: StartOnboardingComponent,
      cssClass: 'start-preboarding-modal',
      componentProps: {
        candidate: candidate, // ✅ selected candidate’s ID
      },
    });

    await modal.present();
  }

  // Open form in modal
  async openCandidateForm() {
    const modal = await this.modalCtrl.create({
      component: CandiateCreateComponent,
      cssClass: 'side-custom-popup ',
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      console.log('Form Submitted Data:', data);
      // ✅ add candidate to array if needed
      // this.candidates.push(data);
    }
  }

  employee(candidate: any) {
    const settingData = {
      id: candidate.id,
      firstName: candidate.personalDetails.FirstName,
      lastName: candidate.personalDetails.LastName,
      email: candidate.personalDetails.email,
      MiddleName: candidate.personalDetails.gender,
      PhoneNumber: candidate.personalDetails.PhoneNumber,
      gender: candidate.personalDetails.gender,
      initials: candidate.personalDetails.initials,
      JobTitle: candidate.jobDetailsForm.JobTitle,
      Department: candidate.jobDetailsForm.Department,
      JobLocation: candidate.jobDetailsForm.JobLocation,
      WorkType: candidate.jobDetailsForm.WorkType,
      BusinessUnit: candidate.jobDetailsForm.BussinessUnit,
    };
    // this.candidateService.createEmployee(settingData).subscribe();
  }
  Rejectedemployee(candidate: any) {
    const settingData = {
      id: candidate.id,
      firstName: candidate.personalDetails.FirstName,
      lastName: candidate.personalDetails.LastName,
      email: candidate.personalDetails.email,
      MiddleName: candidate.personalDetails.gender,
      PhoneNumber: candidate.personalDetails.PhoneNumber,
      gender: candidate.personalDetails.gender,
      initials: candidate.personalDetails.initials,
      JobTitle: candidate.jobDetailsForm.JobTitle,
      Department: candidate.jobDetailsForm.Department,
      JobLocation: candidate.jobDetailsForm.JobLocation,
      WorkType: candidate.jobDetailsForm.WorkType,
      BusinessUnit: candidate.jobDetailsForm.BussinessUnit,
    };
    this.candidateService.createRejectedEmployee(settingData).subscribe();
  }
  employeehire(candidate: any) {
    this.hireEmployeeService.setCandidate(candidate);
    this.candidates = this.candidates.filter((c) => c.id !== candidate.id);
  }



  onFilterChange(type: string, event: any) {
    const value = event.detail.value;

    // Update the selected values dynamically
    if (type === 'businessunit') {
      this.selectedBusiness = value;
    } else if (type === 'jobtitle') {
      this.selectedJobTitle = value;
    } else if (type === 'department') {
      this.selectedDept = value;
    } else if (type === 'location') {
      this.selectedLocation = value;
    } else if (type === 'text') {
      this.searchText = event.detail.value.toLowerCase();
    }
    this.applyFilters();
  }


  // applyFilters(){
  //   let filtered = [...this.filterCandidates];
  //    if (this.selectedJobTitle) {
  //   filtered = filtered.filter(c => c.JobTitle === this.selectedJobTitle);
  // }

  // if (this.selectedBusiness) {
  //   filtered = filtered.filter(c => c.BusinessUnit === this.selectedBusiness);
  // }

  // if (this.selectedDept) {
  //   filtered = filtered.filter(c => c.Department === this.selectedDept);
  // }

  // if (this.selectedLocation) {
  //   filtered = filtered.filter(c => c.JobLocation === this.selectedLocation);
  // }
  //  if (this.searchText) {
  //   const txt = this.searchText.toLowerCase();
  //   filtered = filtered.filter(c =>
  //     c.JobTitle.toLowerCase().includes(txt) ||
  //     c.Department.toLowerCase().includes(txt) ||
  //     c.JobLocation.toLowerCase().includes(txt) ||
  //     c.BusinessUnit.toLowerCase().includes(txt) ||
  //     c.status.toLowerCase().includes(txt) ||
  //     c.FirstName.toLowerCase().includes(txt)
  //   );
  //     this.candidates = filtered;
  // }
  //   // Filter candidates based on all selected filters including search text
  //   this.candidates = this.filterCandidates.filter(c => {
  //     const businessMatch = this.selectedBusiness ? c.BusinessUnit === this.selectedBusiness : true;
  //     const jobMatch = this.selectedJobTitle ? c.JobTitle === this.selectedJobTitle : true;
  //     const deptMatch  = this.selectedDept ? c.Department === this.selectedDept : true;
  //     const locationMatch  = this.selectedLocation ? c.JobLocation === this.selectedLocation : true;

  //     // Search text match across multiple fields
  //     const searchMatch = this.searchText ? (
  //       c.JobTitle.toLowerCase().includes(this.searchText) ||
  //       c.Department.toLowerCase().includes(this.searchText) ||
  //       c.JobLocation.toLowerCase().includes(this.searchText) ||
  //       c.BusinessUnit.toLowerCase().includes(this.searchText) ||
  //       c.status.toLowerCase().includes(this.searchText) ||
  //       c.FirstName.toLowerCase().includes(this.searchText)
  //     ) : true;

  //     return businessMatch && jobMatch && deptMatch && locationMatch && searchMatch;
  //   });
  // }
  applyFilters() {
    // Always start from master list
    let filtered = [...this.filterCandidates];

    // Business Unit
    if (this.selectedBusiness) {
      filtered = filtered.filter(c => c.BusinessUnit === this.selectedBusiness);
    }

    // Job Title
    if (this.selectedJobTitle) {
      filtered = filtered.filter(c => c.JobTitle === this.selectedJobTitle);
    }

    // Department
    if (this.selectedDept) {
      filtered = filtered.filter(c => c.Department === this.selectedDept);
    }

    // Location
    if (this.selectedLocation) {
      filtered = filtered.filter(c => c.JobLocation === this.selectedLocation);
    }

    // Search
    if (this.searchText) {
      const txt = this.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.JobTitle.toLowerCase().includes(txt) ||
        c.Department.toLowerCase().includes(txt) ||
        c.JobLocation.toLowerCase().includes(txt) ||
        c.BusinessUnit.toLowerCase().includes(txt) ||
        c.status.toLowerCase().includes(txt) ||
        c.FirstName.toLowerCase().includes(txt)
      );
    }

    // FINAL result
    this.candidates = filtered;
  }

  // Filtered by Search - now works with existing filters
  SearchCandidates(event: any) {
    const val = event.target.value.toLowerCase().trim();
    this.searchText = val;
    this.applyFilters();
  }

  clearSearch(searchInput?: HTMLInputElement) {
    if (searchInput) searchInput.value = '';
    this.searchText = '';
    this.applyFilters(); // Apply filters without search text
  }
  preonboard() {
    //this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.router.navigate(['./onboarding_Tasks']);
    //});
  }
  onboard() {
    this.router.navigate(['./preonboarding-setup']);
  }
  org() {
    this.router.navigate(['./pre-onboarding-cards']);
  }
}
