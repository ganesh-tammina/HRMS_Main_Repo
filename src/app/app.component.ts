import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { addIcons } from 'ionicons';
// import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Candidate, CandidateService } from './services/pre-onboarding.service';
import { Observable } from 'rxjs/internal/Observable';
import { HeaderComponent } from './shared/header/header.component';
import { RouteGuardService } from './services/route-guard/route-service/route-guard.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    CommonModule,
    IonicModule,
  ],
})
export class AppComponent implements OnInit {
  public showCategories = false;
  showMenu = true;
  currentUser: Observable<Candidate | null>;
  isLoginPage = false
  iscandiateofferPage = false
  iscandiateofferLetterPage = false
  CurrentuserType: string = ''
  userType: string | null = null;
  one: any;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private routeGaurdService: RouteGuardService
  ) {
    this.currentUser = this.candidateService.currentCandidate$;
    // addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide menu on login page
        this.showMenu = !event.urlAfterRedirects.includes('/login');
        console.log("this.showMenu", this.showMenu)
        this.isLoginPage = event.urlAfterRedirects.includes('/login');
        console.log("this.isLoginPage", this.isLoginPage)
        this.iscandiateofferPage = event.urlAfterRedirects.includes('/candidate_status');
        console.log("this.iscandiateofferPage", this.iscandiateofferPage)
        this.iscandiateofferLetterPage = event.urlAfterRedirects.includes('/candidate-offer-letter');
        console.log("this.iscandiateofferLetterPage", this.iscandiateofferLetterPage)
        this.iscandiateofferPage =
          event.urlAfterRedirects.includes('/candidate_status');
        console.log("this.iscandiateofferPage", this.iscandiateofferPage)

        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
          const parsedData = JSON.parse(userData);
          this.userType = parsedData.type;
          console.log('User type:', this.userType);
        } else {
          this.userType = null;
        }
      }
    });
  }

  toggleDropdown() {
    this.showCategories = !this.showCategories;
  }
  ngOnInit(): void {
    if (this.routeGaurdService.token && this.routeGaurdService.refreshToken) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          this.one = response.data[0];
          console.log(this.one);
        },
        error: (err) => {
          console.error('Error fetching all employees:', err);
        },
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
  // preonboard() {
  //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //     this.router.navigate(['/pre_onboarding']);
  //   });
  //   window.location.href = '/pre_onboarding';
  // }
  preonboard() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/pre-onboarding-cards']);
    });
    window.location.href = '/pre-onboarding-cards';
  }

  logout() {
    // this.candidateService.logout();
    this.candidateService.logout();
    this.router.navigate(['/login']);
  }
}
