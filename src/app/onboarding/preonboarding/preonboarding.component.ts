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
      this.candidates = data.candidates;
      this.filterCandidates = data.candidates;
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
    this.candidateService.createEmployee(settingData).subscribe();
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
    }else if (type === 'jobtitle') {
      this.selectedJobTitle = value;
    }else if (type === 'department') {
      this.selectedDept = value;
    }else if (type === 'location') {
      this.selectedLocation = value;
    }else if (type === 'text') {
      this.searchText = event.detail.value.toLowerCase();
    }
    this.applyFilters();
  }


  applyFilters(){
    // Filter candidates based on all selected filters
    this.candidates = this.filterCandidates.filter(c => {
      const businessMatch = this.selectedBusiness ? c.BusinessUnit === this.selectedBusiness : true;
      const jobMatch = this.selectedJobTitle ? c.JobTitle === this.selectedJobTitle : true;
      const deptMatch  = this.selectedDept ? c.Department === this.selectedDept : true;
      const locationMatch  = this.selectedLocation ? c.JobLocation === this.selectedLocation : true;   
      return businessMatch && jobMatch && deptMatch && locationMatch;
    });
  }


  // Filtered by Search
  SearchCandidates(event: any) {
    const val = event.target.value.toLowerCase().trim();
    this.searchText = val;
    if (val === '') {
      this.candidates = this.filterCandidates;
    } else {
      this.candidates = this.filterCandidates.filter(c =>
        c.JobTitle.toLowerCase().includes(val) ||
        c.Department.toLowerCase().includes(val) ||
        c.JobLocation.toLowerCase().includes(val) ||
        c.BusinessUnit.toLowerCase().includes(val) ||
        c.status.toLowerCase().includes(val) ||
        c.FirstName.toLowerCase().includes(val)
      );
    }
  }

  clearSearch(searchInput?: HTMLInputElement) {
  if (searchInput) searchInput.value = '';
  this.searchText = '';
  // restore full list
  this.candidates = Array.isArray(this.filterCandidates) ? [...this.filterCandidates] : [];
 }

}
