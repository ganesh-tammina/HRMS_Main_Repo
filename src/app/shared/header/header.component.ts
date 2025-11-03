import { Component, Input, OnInit } from '@angular/core';
import {
  CandidateService,
  Candidate,
} from 'src/app/services/pre-onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeListModalComponent } from '../employee-list-modal/employee-list-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})
export class HeaderComponent implements OnInit {
  currentCandidate: Candidate | null = null;

  // Search functionality
  searchQuery: string = '';
  searchResults: Candidate[] = [];
  results: any;
  one: any;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  @Input() employee: any;
  fullName: any;

  constructor(
    private candidateService: CandidateService,
    private modalCtrl: ModalController,
    private routeGuardService: RouteGuardService
  ) {}

  ngOnInit() {
    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          this.one = response.data[0];
          this.fullName = this.one[0].full_name;
          console.log(this.one);
        },
        error: (err) => {
          console.error('Error fetching all employees:', err);
        },
      });
      // Subscribe to current candidate observable
      this.candidateService.currentCandidate$.subscribe((user) => {
        this.currentCandidate = user;
      });

      // Fallback: if page refreshed
      if (!this.currentCandidate) {
        this.currentCandidate = this.candidateService.getCurrentCandidate();
      }
    }
  }

  // Logout method
  logout() {
    this.candidateService.logout();
    window.location.href = '/login';
  }

  viewProfile() {
    window.location.href = '../../profile-page';
  }

  // Search employees by name
  onSearch() {
    if (!this.searchQuery || this.searchQuery.trim().length < 3) {
      this.searchResults = [];
      this.results = [];
      return;
    }

    this.searchResults = this.candidateService.searchCandidates(
      this.searchQuery
    );
    // this.results = JSON.stringify(this.searchResults)
    // console.log(this.results)
    this.results = this.searchResults.map(
      (emp) =>
        `${emp.personalDetails.FirstName} ${emp.personalDetails.LastName}`
    );

    console.log(this.results);
  }

  // Open modal to show employee list
  async openEmployeeListModal() {
    const modal = await this.modalCtrl.create({
      component: EmployeeListModalComponent,
      componentProps: { employees: this.searchResults },
    });
    await modal.present();
  }
}
