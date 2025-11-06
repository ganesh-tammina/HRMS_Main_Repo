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
import { NavController } from '@ionic/angular';
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
  isAdmin: boolean = false
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  currentUrl: any;    //get current page

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private routeGaurdService: RouteGuardService,
    private navCtrl: NavController   // ✅ add this

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
    this.currentUrl = this.router.url;

    if (this.routeGaurdService.userRole) {
      this.routeGaurdService.userRole === 'admin' ? this.isAdmin = true : this.isAdmin = false;
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
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login'])
  }
}
