import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';

import moment from 'moment';

import { environment } from 'src/environments/environment';
import { EmployeeService } from '../services/employee.service';
import { CandidateService } from '../services/pre-onboarding.service';
import { ClockButtonComponent } from '../services/clock-button/clock-button.component';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClockButtonComponent,
    RouterLink
  ],
})
export class HomePage implements OnInit {

  /* ================= CONSTANTS ================= */
  private static readonly REFRESH_DELAY_MS = 10;

  /* ================= UI DATA ================= */
  greeting: string = '';
  todayDate: string = '';
  currentTime: string = '';
  workMode: string = 'On-Site';

  /* ================= EMPLOYEE ================= */
  currentEmployee: any = null;

  /* ================= IMAGES ================= */
  env: string = '';
  imageUrls: any;
  backgroundImageUrl: string =
    '../../assets/holidays-pics/christmas_pic.svg';

  /* ================= DASHBOARD ================= */
  days: { date: string; status: 'Complete' | 'Remaining' }[] = [];

  constructor(
    private employeeService: EmployeeService,
    private candidateService: CandidateService,
    private alertController: AlertController,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /* =====================================================
     🔹 ngOnInit → runs ONCE (static data only)
  ===================================================== */
  ngOnInit() {
    this.setupEnvironment();
    this.setupGreetingAndDate();
    this.setupClock();
    this.setupDays();

    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      localStorage.removeItem('showLoginSuccess');
      this.showLoginSuccessAlert();
    }
  }

  /* =====================================================
     🔹 ionViewWillEnter → runs EVERY TIME page opens
     🔥 THIS FIXES YOUR ISSUE
  ===================================================== */
  ionViewWillEnter() {
    this.loadEmployeeProfile();
  }

  /* ================= ENV ================= */
  private setupEnvironment() {
    this.env = environment.apiURL.startsWith('http')
      ? environment.apiURL
      : `http://${environment.apiURL}`;
  }

  /* ================= EMPLOYEE PROFILE ================= */
  private loadEmployeeProfile() {
    // 🔴 Clear old user immediately
    this.currentEmployee = null;

    this.employeeService.getMyProfile().subscribe({
      next: (res: any) => {
        this.currentEmployee = res;
        console.log('Logged-in Employee 👉', this.currentEmployee);

        // Force UI refresh
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Profile load failed', err);
        this.currentEmployee = null;
      }
    });
  }

  /* ================= PROFILE IMAGE ================= */
  get profileImageUrl(): string {
    if (!this.currentEmployee?.profile_image) {
      return 'assets/icon/Default-user.svg';
    }
    return `${this.env}${this.currentEmployee.profile_image}`;
  }

  /* ================= GREETING ================= */
  private setupGreetingAndDate() {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }

    this.todayDate = moment().format('dddd, MMMM DD, YYYY');
  }

  /* ================= CLOCK ================= */
  private setupClock() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: true,
      });
    }, 1000);
  }

  /* ================= WEEK DAYS ================= */
  private setupDays() {
    const today = moment();
    this.days = Array.from({ length: 7 }, (_, i) => {
      const day = today.clone().add(i, 'days');
      return {
        date: day.format('ddd'),
        status: day.isSameOrBefore(today, 'day')
          ? 'Complete'
          : 'Remaining'
      };
    });
  }

  /* ================= ALERT ================= */
  async showLoginSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Information',
      message: 'Login Successful',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            setTimeout(() => { }, HomePage.REFRESH_DELAY_MS);
          }
        }
      ]
    });
    await alert.present();
  }

  /* ================= NAVIGATION ================= */
  attendance() {
    this.router.navigate(['/Me']);
  }

  leaves() {
    this.router.navigate(['/leaves']);
  }

  myteam() {
    this.router.navigate(['/MyTeam']);
  }

  /* ================= OPTIONAL LOGOUT (SAFE) ================= */
  logout() {

  }
}
