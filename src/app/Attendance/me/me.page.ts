import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import {
  CandidateService,
  Candidate,
} from '../../services/pre-onboarding.service';
import {
  AttendanceService,
  AttendanceRecord,
  AttendanceEvent,
} from '../../services/attendance.service';
import { EmployeeHeaderComponent } from './employee-header/employee-header.component';
import { ClockButtonComponent } from '../../services/clock-button/clock-button.component';
import { AttendanceLogComponent } from './attendance-log/attendance-log.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AttendanceRequestComponent } from './attendance-request/attendance-request.component';
import { RadialTimeGraphComponent } from './radial-time-graph/radial-time-graph.component';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { WorkFromHomeComponent } from './work-from-home/work-from-home.component';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AdminService } from 'src/app/services/admin-functionality/admin.service.service';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ClockButtonComponent,
    HeaderComponent,
    EmployeeHeaderComponent,
    CommonModule,
    AttendanceLogComponent,
    CalendarComponent,
    AttendanceRequestComponent,
    RadialTimeGraphComponent,
  ],
})
export class MePage implements OnInit {

  employee?: Candidate;
  record?: AttendanceRecord;

  // ================= SHIFT =================
  shift_id: any;
  allShiftPolicies: any[] = [];
  matchedShiftPolicy: any = null;
  shift_policy: any;

  shift_check_in = '';
  shift_check_out = '';

  // ================= WEEKEND =================
  weekend_id: any;
  allWeekendPolicies: any[] = [];
  matchedWeekendPolicy: any = null;

  serverWeekOff: string[] = []; // final matched weekend days

  // ================= UI / ATTENDANCE =================
  shiftDuration = '9h 0m';
  breakMinutes = 60;
  effectiveHours = '0h 0m';
  grossHours = '0h 0m';
  timeSinceLastLogin = '0h 0m 0s';
  status = 'Absent';

  currentTime = '';
  currentDate = '';
  history: AttendanceEvent[] = [];
  selectedRange: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' = 'TODAY';

  progressValue = 0.85;
  activeTab = 'log';

  currentMonth = new Date();
  days: Date[] = [];
  today: Date = new Date();

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService,
    private modalCtrl: ModalController,
    private routeGuardService: RouteGuardService,
    private attendanceApi: AttendanceApiService,
    private adminService: AdminService,
    private employeeService: EmployeeService
  ) {
    this.generateDays();
  }

  // ---------------------------------------------------------
  ionViewWillEnter() {
    this.initializePage();
  }

  // ---------------------------------------------------------
  ngOnInit() {

    /* ================= SHIFT POLICIES ================= */
    this.adminService.getShiftPolicies().subscribe((res: any[]) => {
      this.allShiftPolicies = res || [];
      console.log('All Shift Policies:', this.allShiftPolicies);
      this.matchEmployeeShift();
    });

    /* ================= WEEKEND POLICIES ================= */
    this.adminService.getWeeklyOffPolicies().subscribe((res: any[]) => {
      this.allWeekendPolicies = res || [];
      console.log('All Weekend Policies:', this.allWeekendPolicies);
      this.matchEmployeeWeekend();
    });

    /* ================= EMPLOYEE PROFILE ================= */
    this.employeeService.getMyProfile().subscribe((rs: any) => {
      this.shift_id = rs.shift_policy_id;
      this.weekend_id = rs.weekly_off_policy_id;

      console.log('Employee Shift ID:', this.shift_id);
      console.log('Employee Weekend ID:', this.weekend_id);

      this.matchEmployeeShift();
      this.matchEmployeeWeekend();
    });

    /* ================= ATTENDANCE STATUS ================= */
    this.attendanceApi.getTodayAttendance().subscribe({
      next: (response: any) => {
        if (response?.has_attendance && response?.attendance) {
          this.status = response.attendance.status;
        } else {
          this.status = 'Absent';
        }
      },
      error: () => (this.status = 'Absent'),
    });
  }

  // ---------------------------------------------------------
  // MATCH SHIFT POLICY
  // ---------------------------------------------------------
  matchEmployeeShift() {
    if (!this.shift_id || !this.allShiftPolicies.length) return;

    this.matchedShiftPolicy = this.allShiftPolicies.find(
      (policy: any) => policy.id === this.shift_id
    );

    if (!this.matchedShiftPolicy) {
      console.warn('No matching shift policy found');
      return;
    }

    this.shift_policy = this.matchedShiftPolicy;
    console.log('Matched Shift Policy:', this.shift_policy);

    this.shift_check_in = this.convertTo12Hour(
      this.matchedShiftPolicy.check_in
    );
    this.shift_check_out = this.convertTo12Hour(
      this.matchedShiftPolicy.check_out
    );
  }

  // ---------------------------------------------------------
  // MATCH WEEKEND POLICY ✅
  // ---------------------------------------------------------
  matchEmployeeWeekend() {
    if (!this.weekend_id || !this.allWeekendPolicies.length) return;

    this.matchedWeekendPolicy = this.allWeekendPolicies.find(
      (policy: any) => policy.id === this.weekend_id
    );

    if (!this.matchedWeekendPolicy) {
      console.warn('No matching weekend policy found');
      return;
    }

    console.log('Matched Weekend Policy:', this.matchedWeekendPolicy);

    /**
     * API supports both formats safely
     * 1) days: "Saturday,Sunday"
     * 2) week_off_days: ["Saturday","Sunday"]
     */

    if (this.matchedWeekendPolicy.days) {
      this.serverWeekOff = this.matchedWeekendPolicy.days
        .split(',')
        .map((d: string) => d.trim().toLowerCase());
    }

    if (Array.isArray(this.matchedWeekendPolicy.week_off_days)) {
      this.serverWeekOff = this.matchedWeekendPolicy.week_off_days.map(
        (d: string) => d.toLowerCase()
      );
    }

    console.log('Final Employee Week Off Days:', this.serverWeekOff);
  }

  // ---------------------------------------------------------
  // HELPERS (UNCHANGED)
  // ---------------------------------------------------------
  convertTo12Hour(time: string): string {
    if (!time) return '';
    const [h, m, s] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s || 0);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  generateDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff =
      today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const firstDayOfWeek = new Date(today.setDate(diff));

    this.days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      this.days.push(date);
    }
  }

  isToday(day: Date) {
    return day.toDateString() === this.today.toDateString();
  }

  isWeekOffDay(day: Date): boolean {
    if (!day || !this.serverWeekOff.length) return false;
    const weekday = day
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    return this.serverWeekOff.includes(weekday);
  }

  initializePage() {
    // untouched attendance logic
  }

  onClockStatusChanged(record: AttendanceRecord) {
    this.record = record;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  async wfh() {
    const modal = await this.modalCtrl.create({
      component: WorkFromHomeComponent,
      cssClass: 'side-custom-popup',
      backdropDismiss: false,
    });
    await modal.present();
  }

  trackByDate(index: number, day: Date) {
    return day ? day.toDateString() : index;
  }
}
