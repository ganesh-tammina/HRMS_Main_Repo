import { Component, OnInit } from '@angular/core';
import { CandidateService, Candidate } from 'src/app/services/pre-onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeListModalComponent } from '../employee-list-modal/employee-list-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';


@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class HeaderComponent implements OnInit {

  currentCandidate: Candidate | null = null;

  // Search functionality
  searchQuery: string = '';
  searchResults: Candidate[] = [];
  results:any

  constructor(
    private candidateService: CandidateService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    // Subscribe to current candidate observable
    this.candidateService.currentCandidate$.subscribe(user => {
      this.currentCandidate = user;
    });

    // Fallback: if page refreshed
    if (!this.currentCandidate) {
      this.currentCandidate = this.candidateService.getCurrentCandidate();
    }
  }

  // Logout method
  logout() {
    this.candidateService.logout();
    window.location.href = '/login';
  }

  // Search employees by name
  onSearch() {
     if (!this.searchQuery || this.searchQuery.trim().length < 3) {
    this.searchResults = [];
    this.results = [];
    return;
  }

    this.searchResults = this.candidateService.searchCandidates(this.searchQuery);
    // this.results = JSON.stringify(this.searchResults)
    // console.log(this.results)
     this.results = this.searchResults.map(emp => `${emp.personalDetails.FirstName} ${emp.personalDetails.LastName}`);

  console.log(this.results); 


  }

  // Open modal to show employee list
  async openEmployeeListModal() {
    const modal = await this.modalCtrl.create({
      component: EmployeeListModalComponent,
      componentProps: { employees: this.searchResults }
    });
    await modal.present();
  }

}
