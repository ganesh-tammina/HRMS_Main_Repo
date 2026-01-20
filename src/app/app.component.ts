// (Removed duplicate and misplaced top-level code)
import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
// import { addIcons } from 'ionicons';
// import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Candidate, CandidateService } from './services/pre-onboarding.service';
import { Observable } from 'rxjs/internal/Observable';
import { HeaderComponent } from './shared/header/header.component';
import { RouteGuardService } from './services/route-guard/route-service/route-guard.service';
import { NavController } from '@ionic/angular';
import { EmployeeService } from './services/employee.service';
import { AdminService } from './services/admin-functionality/admin.service.service';
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
  showIntro = true;
  public showCategories = false;
  showMenu = true;
  currentUser: Observable<Candidate | null>;
  isLoginPage = false;
  iscandiateofferPage = false;
  iscandiateofferLetterPage = false;
  CurrentuserType: string = '';
  userType: string | null = null;
  one: any;
  isAdmin: boolean = false;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  currentUrl: any; //get current page
  isRefreshing = false;
  userRole: string | null = null;

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private routeGaurdService: RouteGuardService,
    private employeeService: EmployeeService,
    private service: AdminService,
    private navCtrl: NavController // ✅ add this
  ) {
    this.currentUser = this.candidateService.currentCandidate$;
    // addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide menu on login page
        this.showMenu = !event.urlAfterRedirects.includes('/login');
        console.log('this.showMenu', this.showMenu);
        this.isLoginPage = event.urlAfterRedirects.includes('/login');
        console.log('this.isLoginPage', this.isLoginPage);
        this.iscandiateofferPage =
          event.urlAfterRedirects.includes('/candidate_status');
        console.log('this.iscandiateofferPage', this.iscandiateofferPage);
        this.iscandiateofferLetterPage = event.urlAfterRedirects.includes(
          '/candidate-offer-letter'
        );
        console.log(
          'this.iscandiateofferLetterPage',
          this.iscandiateofferLetterPage
        );
        this.iscandiateofferPage =
          event.urlAfterRedirects.includes('/candidate_status');
        console.log('this.iscandiateofferPage', this.iscandiateofferPage);

        // Update user role on navigation to ensure menu visibility is correct
        this.userRole = this.routeGaurdService.userRole?.toLowerCase() || null;
        console.log('🔍 Navigation Event - User Role:', this.userRole);
        const role = this.userRole || '';
        this.isAdmin = (role === 'admin' || role === 'hr');

        // Quick refresh effect for main navigation pages after login
        this.handlePageRefresh(event.urlAfterRedirects);

        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
          const parsedData = JSON.parse(userData);
          this.userType = parsedData.type;
          console.log('User type:', this.userType);
        } else {
          this.userType = null;
        }

        // Show intro screen only on first app entry or logout
        const introSeen = localStorage.getItem('introSeen');

        if (!introSeen || this.isLoginPage) {
          this.showIntro = true;

          setTimeout(() => {
            this.showIntro = false;
            if (!introSeen) {
              localStorage.setItem('introSeen', 'true'); // Remember intro was shown
            }
          }, 6000); // Display intro for 3 seconds
        } else {
          this.showIntro = false;
        }
      }
    });
    this.currentUrl = this.router.url;
    console.log("URL", this.currentUrl);
  }

  toggleDropdown() {
    this.showCategories = !this.showCategories;
  }
  ngOnInit(): void {

    // Existing logic
    this.userRole = this.routeGaurdService.userRole?.toLowerCase() || null;
    this.isAdmin = false;

    const role = this.routeGaurdService.userRole?.trim().toLowerCase() || '';
    if (role === 'admin' || role === 'hr') {
      this.isAdmin = true;
    }

    this.service.getAnnouncements().subscribe((r: any) => console.log(r));
  }

  ionViewWillEnter(): void {
    this.ngOnInit();
  }

  dismissIntro() {
    this.showIntro = false;
  }

  // (Removed duplicate role-checking methods)
  // Role checking helper methods
  isAdminOnly(): boolean {
    return this.userRole === 'admin';
  }
  isHROnly(): boolean {
    return this.userRole === 'hr';
  }
  isAdminOrHR(): boolean {
    return this.userRole === 'admin' || this.userRole === 'hr';
  }
  isManager(): boolean {
    return this.userRole === 'manager';
  }
  isManagerOrAbove(): boolean {
    return this.userRole === 'manager' || this.userRole === 'hr';
  }
  isEmployeeOrManagerOrHr(): boolean {
    return this.userRole === 'employee' || this.userRole === 'manager' || this.userRole === 'hr';
  }
  isEmployee(): boolean {
    return this.userRole === 'employee';
  }
  preonboard() {
    this.router.navigate(['/pre-onboarding-cards']);
  }
  logout() {
    localStorage.clear();
    this.employeeService.clearEmployee();
    sessionStorage.clear();
    localStorage.removeItem('introSeen')
    this.router.navigate(['/login'], { replaceUrl: true });
  }
  handlePageRefresh(url: string) {
    // Check if user is logged in and navigating to main pages
    const isLoggedIn =
      this.routeGaurdService.token && this.routeGaurdService.refreshToken;
    const mainPages = ['/Me', '/Home', '/MyTeam', '/admin', '/profile-page'];
    const isMainPage = mainPages.some((page) => url.includes(page));

  }
}