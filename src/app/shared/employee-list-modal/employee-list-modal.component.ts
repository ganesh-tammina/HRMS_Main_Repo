import { Component, OnInit } from '@angular/core';
import { CandidateService, Candidate, CandidateSearchResult } from 'src/app/services/pre-onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { EmployeeListModalComponent } from '../employee-list-modal/employee-list-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { EmployeeProfileModalComponent } from '../employee-profile-modal/employee-profile-modal.component';


@Component({
  selector: 'app-employee-list-modal',
  templateUrl: './employee-list-modal.component.html',
  styleUrls: ['./employee-list-modal.component.scss'],
  standalone: true,
   imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class EmployeeListModalComponent  implements OnInit {
  // currentCandidate: Candidate | null = null;
   // Search functionality
    searchQuery: string = '';
  searchResults: CandidateSearchResult[] = [];
    results:any

  constructor(
        private candidateService: CandidateService,
        private modalCtrl: ModalController
  ) { }

  ngOnInit() {

 
  }
    // Search employees by name
 onSearch() {
    if (!this.searchQuery || this.searchQuery.trim().length < 3) {
      this.searchResults = [];
      this.results = [];
      return;
    }

    this.candidateService.searchCandidates(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.results = this.searchResults.map(
          (emp) =>
            `${emp.first_name} ${emp.last_name}`
        );
      },
    });
    // this.results = JSON.stringify(this.searchResults)
    // console.log(this.results)

    console.log(this.results);
  }


  // Open modal to show employee list
  async openEmployeeProfile(employee: any) {
    const modal = await this.modalCtrl.create({
      component: EmployeeProfileModalComponent,
      componentProps: { employee }
    });
    console.log('Employee Profile Modal opened for:', employee.personalDetails.FirstName);
    await modal.present();
  }
  //  async openEmployeeListModal() {
  //   const modal = await this.modalCtrl.create({
  //     component: EmployeeListModalComponent,
  //     componentProps: { employees: this.searchResults }
  //   });
  //   console.log('Employee List Modal opened');
  //   await modal.present();
    
  // }
}
