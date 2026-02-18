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
import { EmployeeLeavesService } from '../services/employee-leaves.service';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceApiService } from '../services/attendance-api.service';


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
  // Birthday wishes UI state
  activeWishEmployeeId: number | null = null;
  wishMessages: { [employeeId: number]: string } = {};
  birthdayWishes: { [employeeId: number]: string[] } = {};

  /* ================= CONSTANTS ================= */
  private static readonly REFRESH_DELAY_MS = 10;

  /* ================= UI DATA ================= */
  greeting: string = '';
  todayDate: string = '';
  currentTime: string = '';
  currentYear = new Date().getFullYear();
  monthlyAttendanceReport: any[] = [];
  attendanceRate = 0;
  leaveTypes: { code: string; name: string; available: number }[] = [];


  /* ================= EMPLOYEE ================= */
  currentEmployee: any = null;

  /* ================= IMAGES ================= */
  env: string = '';
  imageUrls: any;
  leaveCards: any[] = [];
  userDesignation: string | null = null;
  leaveCodeIdMap: any = {};
  backgroundImageUrl: string = '../../assets/holidays-pics/christmas_pic.svg';

  /* ================= BIRTHDAYS ================= */
  birthdays: any[] = [];

  /* ================= DASHBOARD ================= */
  days: { date: string; status: 'Complete' | 'Remaining' }[] = [];
  cdRef: ChangeDetectorRef;
  constructor(
    private employeeService: EmployeeService,
    private candidateService: CandidateService,
    private alertController: AlertController,
    private router: Router,
    private attendanceService: AttendanceService,
    private attendanceApi: AttendanceApiService,
    private employeeLeaves: EmployeeLeavesService,
    private cdr: ChangeDetectorRef
  ) { this.cdRef = cdr; }

  /* =====================================================
     🔹 ngOnInit → runs ONCE (static data only)
  ===================================================== */
  ngOnInit() {
    this.setupEnvironment();
    this.setupGreetingAndDate();
    this.setupClock();
    this.setupDays();
    this.loadLeaveBalance()

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    this.attendanceService.loadMonthlyReportOnAppStart(
      this.attendanceApi,
      year,
      month
    );

    // ✅ RECEIVE MONTHLY ATTENDANCE
    this.attendanceService.monthlyReport$.subscribe(report => {
      this.monthlyAttendanceReport = report;
      console.log('🏠 Home received monthly attendance:', this.monthlyAttendanceReport);

      // Example calculation
      if (report.length) {
        const presentDays = report.filter(r => r.status === 'present').length;
        this.attendanceRate = Math.round(
          (presentDays / report.length) * 100
        );
      }

      // Force UI update if needed
      this.cdr.detectChanges();
    });

    this.loadBirthdays();

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
    this.loadBirthdays();
  }

  loadBirthdays() {
    this.employeeService.getBirthdays().subscribe({
      next: (data) => {
        this.birthdays = data;
        console.log('🎂 Birthdays:', data);
        // Optionally load existing wishes if API supports
        // this.loadBirthdayWishes();
      },
      error: (err) => {
        this.birthdays = [];
        console.error('Failed to fetch birthdays:', err);
      }
    });
  }

  showWishInput(employeeId: number) {
    this.activeWishEmployeeId = employeeId;
    if (!this.wishMessages[employeeId]) {
      this.wishMessages[employeeId] = '';
    }
  }

  hideWishInput() {
    this.activeWishEmployeeId = null;
  }

  sendWish(employeeId: number) {
    const message = this.wishMessages[employeeId]?.trim();
    if (!message) return;
    this.employeeService.sendBirthdayWish(employeeId, message).subscribe({
      next: () => {
        if (!this.birthdayWishes[employeeId]) {
          this.birthdayWishes[employeeId] = [];
        }
        this.birthdayWishes[employeeId].push(message);
        this.wishMessages[employeeId] = '';
        this.hideWishInput();
      },
      error: (err) => {
        alert('Failed to send wish');
        console.error('Failed to send wish:', err);
      }
    });
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
        this.userDesignation = res.designation_name || res.designation || null;

        console.log("Employee Designation 👉", this.userDesignation);
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
  /* ===================== LEAVE TYPE → ID ===================== */
  private mapLeaveCodeToId(code: string): number {
    const id = this.leaveCodeIdMap[code];

    if (!id) {
      console.error('Leave type ID not found for code:', code);
    }

    return id;
  }
  /* ===================== LEAVE BALANCE ===================== */
  loadLeaveBalance() {
    this.employeeLeaves.getLeaveBalance(this.currentYear).subscribe({
      next: (res: any[]) => {
        this.leaveCodeIdMap = {};
        res.forEach(item => {
          this.leaveCodeIdMap[item.type_code] = item.leave_type_id || item.id;
        });
        this.leaveCards = res.map(item => ({
          title: item.type_name,
          allocated_days: Number(item.allocated_days),
          used: Number(item.used_days),
          available: Number(item.available_days),
          icon: this.getLeaveIcon(item.type_code),
        }));
        console.log(this.leaveCards, 'leaves')

        this.leaveTypes = res.map(item => ({
          code: item.type_code,
          name: item.type_name,
          available: Number(item.available_days),
        }));
      },
      error: err => console.error(err),
    });
  }
  getLeaveIcon(code: string): string {
    const map: any = {
      CL: 'CL.svg',
      SL: 'SL.svg',
      ML: 'ML.svg',
      CO: 'CO.svg',
      PL: 'CL.svg',
      UL: 'UL.svg',
    };
    return `../../../assets/leave-icons/${map[code] || 'CL.svg'}`;
  }

  isCEO(): boolean {
    return this.currentEmployee?.designation_name?.toLowerCase() === 'ceo';
  }
}
