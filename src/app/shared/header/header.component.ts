import { Component, Input, OnInit } from '@angular/core';
import {
  CandidateService,
  Candidate,
  Employee,
} from 'src/app/services/pre-onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeListModalComponent } from '../employee-list-modal/employee-list-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

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
  currentemp: any;
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  constructor(
    private candidateService: CandidateService,
    private modalCtrl: ModalController,
    private routeGuardService: RouteGuardService,
    private router: Router,
    private navCtrl: NavController   // ✅ add this

  ) { }

  ngOnInit() {

    this.currentEmployee$ = this.candidateService.currentEmployee$;

    this.currentEmployee$.subscribe((emp: any) => {
      if (Array.isArray(emp) && emp.length > 0) {
        this.currentemp = emp[0]; // ✅ pick first employee object
      } else {
        this.currentemp = emp; // if it's already a single object
      }

      console.log('Current Employee:', this.currentemp);
    });


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


      // Fallback: if page refreshed

    }
  }

  // Logout method
  logout() {
    this.candidateService.logout();

  }

  viewProfile() {
    this.navCtrl.navigateForward('/profile-page');
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
