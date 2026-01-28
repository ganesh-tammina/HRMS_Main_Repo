import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Candidate, CandidateService } from './services/pre-onboarding.service';
import { Observable } from 'rxjs/internal/Observable';
import { HeaderComponent } from './shared/header/header.component';
import { RouteGuardService } from './services/route-guard/route-service/route-guard.service';
import { NavController } from '@ionic/angular';
import { EmployeeService } from './services/employee.service';
import { AdminService } from './services/admin-functionality/admin.service.service';
import { AuthService } from './services/login-services.service';

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
  userDesignation: string | null = null;
  userDepartment: string | null = null;

  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private routeGaurdService: RouteGuardService,
    private employeeService: EmployeeService,
    private service: AdminService,
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    this.currentUser = this.candidateService.currentCandidate$;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showMenu = !event.urlAfterRedirects.includes('/login');
        this.isLoginPage = event.urlAfterRedirects.includes('/login');
        this.iscandiateofferPage = event.urlAfterRedirects.includes('/candidate_status');
        this.iscandiateofferLetterPage = event.urlAfterRedirects.includes('/candidate-offer-letter');
        this.userRole = this.routeGaurdService.userRole?.toLowerCase() || null;
        const role = this.userRole || '';
        this.isAdmin = (role === 'admin' || role === 'hr');
        this.handlePageRefresh(event.urlAfterRedirects);
        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
          const parsedData = JSON.parse(userData);
          this.userType = parsedData.type;
        } else {
          this.userType = null;
        }
        const introSeen = localStorage.getItem('introSeen');
        if (!introSeen || this.isLoginPage) {
          this.showIntro = true;
          setTimeout(() => {
            this.showIntro = false;
            if (!introSeen) {
              localStorage.setItem('introSeen', 'true');
            }
          }, 5000);
        } else {
          this.showIntro = false;
        }
        // Fetch user department and designation from profile
        this.employeeService.getMyProfile().subscribe(emp => {
          this.userDesignation = (emp?.designation_name || emp?.designation || '').toLowerCase();
          this.userDepartment = (emp?.department_name || emp?.department || '').toLowerCase();
        });
      }
    });
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
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

  shouldShowWorkTrack(): boolean {
    if (!this.isEmployeeOrManagerOrHr()) return false;
    if (this.userDepartment && this.userDepartment.trim().toLowerCase() === 'management') {
      return false;
    }
    return true;
  }

  shouldShowLeave(): boolean {
    // Hide leave for CEO
    return !(this.userDesignation && this.userDesignation.trim().toLowerCase() === 'ceo');
  }

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
    this.authService.logout();
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
    // ...existing logic if needed
  }
}