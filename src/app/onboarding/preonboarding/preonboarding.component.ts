import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { OnboardingMainheaderComponent } from '../onboarding-mainheader/onboarding-mainheader.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { Router } from '@angular/router';
import { CandiateCreateComponent } from '../candiate-create/candiate-create.component';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
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

  candidates: any[] = [];
  filterCandidates: any[] = [];

  BusinessunitList: string[] = [];
  JobTitleList: string[] = [];
  DeptList: string[] = [];
  LocationList: string[] = [];

  selectedBusiness = '';
  selectedJobTitle = '';
  selectedDept = '';
  selectedLocation = '';
  searchText = '';

  @Input() currentStage = 1;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private candidateService: CandidateService,
    private hireEmployeeService: HireEmployeesService,
    private candidateDetailsService: CandidateDetailsService
  ) {}

  ngOnInit() {
    this.loadApiCandidates();
    this.loadLocalCandidate();
  }

  /* ================= API CANDIDATES ================= */
  loadApiCandidates() {
    this.candidateDetailsService.getCandidates().subscribe((res: any) => {
      const apiCandidates = res?.candidates || [];

      const normalized = apiCandidates.map((c: any) => ({
        ...c,
        isDraft: false
      }));

      this.candidates = [...normalized];
      this.filterCandidates = [...normalized];

      this.buildFilters();
    });
  }

  /* ================= LOCAL (DRAFT) CANDIDATE ================= */
  loadLocalCandidate() {
    const saved = localStorage.getItem('candidate_personal_details');
    if (!saved) return;

    const p = JSON.parse(saved);

    const draftCandidate = {
      id: 'DRAFT_' + Date.now(),
      FirstName: p.full_name,
      JobTitle: '—',
      BusinessUnit: '—',
      Department: '—',
      JobLocation: '—',
      date_joined: '—',
      status: 'pending',
      isDraft: true
    };

    this.candidates.unshift(draftCandidate);
    this.filterCandidates.unshift(draftCandidate);

    this.buildFilters();
  }

  /* ================= FILTER LISTS ================= */
  buildFilters() {
    this.JobTitleList = [...new Set(this.filterCandidates.map(c => c.JobTitle))];
    this.BusinessunitList = [...new Set(this.filterCandidates.map(c => c.BusinessUnit))];
    this.DeptList = [...new Set(this.filterCandidates.map(c => c.Department))];
    this.LocationList = [...new Set(this.filterCandidates.map(c => c.JobLocation))];
  }

  /* ================= ADD CANDIDATE ================= */
  async openCandidateForm() {
    const modal = await this.modalCtrl.create({
      component: CandiateCreateComponent,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.step === 'personal') {
      this.loadLocalCandidate();
    }
  }

  /* ================= FILTERS ================= */
  onFilterChange(type: string, event: any) {
    const val = event.detail.value;

    if (type === 'businessunit') this.selectedBusiness = val;
    if (type === 'jobtitle') this.selectedJobTitle = val;
    if (type === 'department') this.selectedDept = val;
    if (type === 'location') this.selectedLocation = val;

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.filterCandidates];

    if (this.selectedBusiness)
      filtered = filtered.filter(c => c.BusinessUnit === this.selectedBusiness);

    if (this.selectedJobTitle)
      filtered = filtered.filter(c => c.JobTitle === this.selectedJobTitle);

    if (this.selectedDept)
      filtered = filtered.filter(c => c.Department === this.selectedDept);

    if (this.selectedLocation)
      filtered = filtered.filter(c => c.JobLocation === this.selectedLocation);

    if (this.searchText) {
      const txt = this.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.FirstName.toLowerCase().includes(txt) ||
        c.status.toLowerCase().includes(txt)
      );
    }

    this.candidates = filtered;
  }

  SearchCandidates(event: any) {
    this.searchText = event.target.value.toLowerCase();
    this.applyFilters();
  }

  clearSearch(input?: HTMLInputElement) {
    if (input) input.value = '';
    this.searchText = '';
    this.applyFilters();
  }

  /* ================= START PREONBOARDING ================= */
  async startpreonboarding(candidate: any) {
    const modal = await this.modalCtrl.create({
      component: StartOnboardingComponent,
      cssClass: 'start-preboarding-modal',
      componentProps: { candidate },
    });
    await modal.present();
  }

  /* ================= HIRE ================= */
  employeehire(candidate: any) {
    this.hireEmployeeService.setCandidate(candidate);
    this.candidates = this.candidates.filter(c => c.id !== candidate.id);
  }

  preonboard() {
    this.router.navigate(['./onboarding_Tasks']);
  }
}
