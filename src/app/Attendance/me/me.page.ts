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

  one: any;
  shift_policy: any;

  shift_id: any;
  weekend_id: any;
  allShiftPolicies: any[] = [];
  matchedShiftPolicy: any = null;

  week_off_days: string[] = [];
  serverWeekOff: any;

  shift_check_in = '';
  shift_check_out = '';

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

  shiftpolicy: any;

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
  // DO NOT CHANGE
  // ---------------------------------------------------------
  ionViewWillEnter() {
    this.initializePage();
  }

  // ---------------------------------------------------------
  // ONLY REQUIRED FIX IS INSIDE ngOnInit
  // ---------------------------------------------------------
  ngOnInit() {

    // ✅ FIX 1: STORE SHIFT POLICIES (previously lost due to console.log)
    this.adminService.getShiftPolicies().subscribe((res: any[]) => {
      this.allShiftPolicies = res || [];
      console.log('All Shift Policies:', this.allShiftPolicies);
      this.matchEmployeeShift(); // try matching when policies arrive
    });

    this.adminService.getWeeklyOffPolicies().subscribe((res: any[]) => {
      console.log('Week Off Policies:', res);
      this.week_off_days = res.map((item: any) => item.day);
    });

    // ✅ FIX 2: SHIFT ID ARRIVES HERE
    this.employeeService.getMyProfile().subscribe((rs: any) => {
      this.shift_id = rs.shift_policy_id;
      this.weekend_id = rs.weekly_off_policy_id;
      console.log('Weekend ID:', this.weekend_id);
      console.log('Employee Shift Policy ID:', this.shift_id);
      this.matchEmployeeShift(); // try matching when id arrives
    });

    // --------------------------------------------
    // EXISTING CODE — NOT TOUCHED
    // --------------------------------------------
    this.attendanceApi.getTodayAttendance().subscribe({
      next: (response: any) => {
        if (response?.has_attendance && response?.attendance) {
          this.status = response.attendance.status;
        } else {
          this.status = 'Absent';
        }
      },
      error: () => this.status = 'Absent'
    });
  }

  // ---------------------------------------------------------
  // MATCH EMPLOYEE SHIFT (UNCHANGED)
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
    this.shift_policy = this.matchedShiftPolicy
    console.log('Matched Shift Policy:', this.shift_policy);

    this.shift_check_in = this.convertTo12Hour(this.matchedShiftPolicy.check_in);
    this.shift_check_out = this.convertTo12Hour(this.matchedShiftPolicy.check_out);

    if (this.matchedShiftPolicy.week_off_days) {
      this.splitWeeks(this.matchedShiftPolicy.week_off_days);
    }
  }

  // ---------------------------------------------------------
  // EXISTING METHODS (UNCHANGED)
  // ---------------------------------------------------------
  convertTo12Hour(time: string): string {
    if (!time) return '';
    const [h, m, s] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s || 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  splitWeeks(weeds: string) {
    this.serverWeekOff = weeds.split(',').map(d => d.trim().toLowerCase());
  }

  generateDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const firstDayOfWeek = new Date(today.setDate(diff));

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
    if (!day || !this.serverWeekOff) return false;
    const weekday = day.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
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
