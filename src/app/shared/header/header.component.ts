import { Component, Input, OnInit } from '@angular/core';
import {
  CandidateService,
  Candidate,
  Employee,
  CandidateSearchResult,
} from 'src/app/services/pre-onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeListModalComponent } from '../employee-list-modal/employee-list-modal.component';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
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
  searchResults: CandidateSearchResult[] = [];
  results: any;
  one: any;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  @Input() employee: any;
  fullName: any;
  currentemp: any;
  employee_id: any;
  uploadedImageUrl: string | null = null;
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  imageUrls: any;

  profileimg: string = environment.apiURL;

  constructor(
    private candidateService: CandidateService,
    private modalCtrl: ModalController,
    private routeGuardService: RouteGuardService,
    private router: Router,
    private navCtrl: NavController // ✅ add this
  ) { }

  ngOnInit() {
    this.candidateService.Employee$.subscribe((employees) => {
      console.log('👀 Employee$ value:', employees);
    });

    // Load profile image from localStorage
    this.uploadedImageUrl = localStorage.getItem('uploadedImageUrl');

    // Listen for profile image updates
    this.candidateService.profileImage$.subscribe((imageUrl) => {
      if (imageUrl) {
        this.uploadedImageUrl = imageUrl;
        console.log('🖼️ Header: Profile image updated to:', imageUrl);
      } else if (imageUrl === '') {
        // Handle logout case
        this.uploadedImageUrl = null;
        console.log('🖼️ Header: Profile image cleared on logout');
      }
    });
    console.log(
      '🖼️ Loaded image URL from localStorage:',
      this.uploadedImageUrl
    );

    // this.currentEmployee$ = this.candidateService.currentEmployee$;

    // this.currentEmployee$.subscribe((emp: any) => {
    //   if (Array.isArray(emp) && emp.length > 0) {
    //     this.currentemp = emp[0]; // ✅ pick first employee object
    //   } else {
    //     this.currentemp = emp; // if it's already a single object
    //   }

    //   console.log('Current Employee:', this.currentemp);
    // });

    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          if (this.allEmployees.length > 0) {
            this.one = this.allEmployees[0];
            this.fullName = this.one[0].full_name;
            this.employee_id = this.one[0].employee_id;
            if (this.one[0].image) {
              this.imageUrls = `https://${this.profileimg}${this.one[0].image}`;
            } else {
              this.imageUrls = '../../../assets/user.svg';
            }
            console.log('profile', this.imageUrls);
            localStorage.setItem('employee_id', this.employee_id);
            this.candidateService.setLoggedEmployeeId(this.employee_id);
            console.log(this.fullName);

            console.log(this.employee_id);
          }
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

    this.candidateService.searchCandidates(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.employee = this.searchResults;
        this.openEmployeeListModal(results);
        this.results = this.searchResults.map(
          (emp) => `${emp.first_name} ${emp.last_name}`
        );
      },
    });
    // this.results = JSON.stringify(this.searchResults)
    // console.log(this.results)

    console.log(this.results);
  }

  // Get profile image URL with fallback
  getProfileImageUrl(): string {
    // Always check localStorage for latest image
    const latestImage = localStorage.getItem('uploadedImageUrl');
    if (latestImage) {
      this.uploadedImageUrl = latestImage;
      return latestImage;
    }
    // If localStorage is empty, clear component cache and return default
    this.uploadedImageUrl = null;
    return '../../../assets/user.svg';
  }

  // Open modal to show employee list
  async openEmployeeListModal(data: any) {
    const modal = await this.modalCtrl.create({
      component: EmployeeListModalComponent,
      componentProps: { employees: data },
    });
    await modal.present();
  }
}
