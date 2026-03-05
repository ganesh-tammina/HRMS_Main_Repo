import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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

import { WorkFromHomeComponent } from './work-from-home/work-from-home.component';
import { RemoteClockinModalComponent } from './remote-clockin-modal.component';
import { AttendanceApiService } from '../../services/attendance-api.service';
import { AdminService } from 'src/app/services/admin-functionality/admin.service.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { TimeFormatPipe } from './time-format.pipe';

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ClockButtonComponent,
    EmployeeHeaderComponent,
    AttendanceLogComponent,
    CalendarComponent,
    AttendanceRequestComponent,
    RadialTimeGraphComponent,
    RemoteClockinModalComponent,
  ],
  // ...existing code...
})
export class MePage implements OnInit {
  @ViewChild(ClockButtonComponent) clockButton!: ClockButtonComponent;
  public async openRemoteClockinModal() {
    const modal = await this.modalCtrl.create({
      component: RemoteClockinModalComponent,
      cssClass: 'checkinInfo-popup side-custom-popup',
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.showToast('Remote Clock-In request submitted', 'success');
      // Always trigger attendance log refresh
      this.attendanceRefresh = Date.now();
      // Debug: Log ViewChild and data
      console.log('Remote modal dismissed with:', data, 'clockButton:', this.clockButton);
      // If remote clock-in was successful, update clock button UI instantly
      if (data.forceRemote && this.clockButton) {
        console.log('Calling clockButton.clockIn(true)');
        // Set clock button to Remote mode and show Remote Clock-Out instantly
        this.clockButton.workMode = 'Remote';
        this.clockButton.isClockedIn = true;
        this.clockButton.remoteActive = true;
      } else if (data.forceRemote) {
        console.warn('clockButton ViewChild not set!');
      }
    }
  }
  attendanceRefresh = 0;

  employee?: Candidate;
  record?: AttendanceRecord;

  // ================= SHIFT =================
  shift_id: any;
  allShiftPolicies: any[] = [];
  shift_policy: any;

  // ================= WEEKEND =================
  weekend_id: any;
  allWeekendPolicies: any[] = [];
  serverWeekOff: string[] = [];

  // ================= UI =================
  shiftDuration = '9h 0m';
  breakMinutes = 60;
  effectiveHours = '00:00';
  grossHours = '00:00';
  status = 'Absent';

  history: AttendanceEvent[] = [];
  activeTab = 'log';
  progressValue = 0.85;

  days: Date[] = [];
  today: Date = new Date();

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService,
    private modalCtrl: ModalController,
    private attendanceApi: AttendanceApiService,
    private adminService: AdminService,
    private employeeService: EmployeeService,
    private toastCtrl: ToastController
  ) {
    this.generateDays();
  }

  // ================= INIT =================
  ngOnInit() {
    this.loadShiftPolicies();
    this.loadWeekendPolicies();
    this.loadEmployeeProfile();
    this.loadTodayAttendance();
  }

  // ================= DATA LOADERS =================

  loadShiftPolicies() {
    this.adminService.getShiftPolicies().subscribe(res => {
      this.allShiftPolicies = res || [];
      this.matchEmployeeShift();
    });
  }

  loadWeekendPolicies() {
    this.adminService.getWeeklyOffPolicies().subscribe(res => {
      this.allWeekendPolicies = res || [];
      this.matchEmployeeWeekend();
    });
  }

  loadEmployeeProfile() {
    this.employeeService.getMyProfile().subscribe(profile => {
      this.shift_id = profile.shift_policy_id;
      this.weekend_id = profile.weekly_off_policy_id;
      this.matchEmployeeShift();
      this.matchEmployeeWeekend();
    });
  }

  loadTodayAttendance() {
    this.attendanceApi.getTodayAttendance().subscribe({
      next: (res: any) => {
        this.status = res?.attendance?.status || 'Absent';
        if (res?.attendance) {
          const pipe = new TimeFormatPipe();
          this.grossHours = pipe.transform(res.attendance.gross_hours);
          this.effectiveHours = pipe.transform(res.attendance.total_work_hours);
        } else {
          this.grossHours = '00:00';
          this.effectiveHours = '00:00';
        }
      },
      error: () => {
        this.status = 'Absent';
        this.grossHours = '00:00';
        this.effectiveHours = '00:00';
      },
    });
  }

  // ================= MATCHERS =================

  matchEmployeeShift() {
    if (!this.shift_id || !this.allShiftPolicies.length) return;
    this.shift_policy = this.allShiftPolicies.find(
      (p: any) => p.id === this.shift_id
    );
  }

  matchEmployeeWeekend() {
    if (!this.weekend_id || !this.allWeekendPolicies.length) {
      console.log('Weekend match skipped:', {
        weekend_id: this.weekend_id,
        policies: this.allWeekendPolicies.length,
      });
      return;
    }

    const policy = this.allWeekendPolicies.find(
      (p: any) => p.id === this.weekend_id
    );

    console.log('Matched Weekend Policy 👉', policy);

    if (!policy) {
      console.warn('No weekend policy found for weekend_id:', this.weekend_id);
      return;
    }

    const weekMap = [
      { key: 'sunday_off', label: 'sunday' },
      { key: 'monday_off', label: 'monday' },
      { key: 'tuesday_off', label: 'tuesday' },
      { key: 'wednesday_off', label: 'wednesday' },
      { key: 'thursday_off', label: 'thursday' },
      { key: 'friday_off', label: 'friday' },
      { key: 'saturday_off', label: 'saturday' },
    ];

    this.serverWeekOff = weekMap
      .filter(day => policy[day.key] === 1)
      .map(day => day.label);

    console.log('Server Week Off Days 👉', this.serverWeekOff);
  }
  trackByDate(index: number, day: Date): string {
    return day.toDateString();
  }

  // ================= WFH CLOCK-IN =================

  wfhClockIn() {
    this.attendanceApi.checkTodayWFH().subscribe({
      next: (res: any) => {
        if (!res?.has_wfh) {
          this.showToast('WFH not approved for today', 'warning');
          return;
        }

        this.attendanceApi.apiPunchIn({
          work_mode: 'WFH',
          location: 'Home',
          notes: 'WFH Clock-In',
        }).subscribe({
          next: () => {
            this.showToast('WFH Clock-In successful', 'success');
            this.loadTodayAttendance();
            // Set clock button to WFH mode and show WFH Clock-Out
            if (this.clockButton) {
              this.clockButton.workMode = 'WFH';
              this.clockButton.isClockedIn = true;
            }
            // Always trigger attendance log refresh
            this.attendanceRefresh = Date.now();
          },
          error: err => {
            this.showToast(err?.error?.message || 'WFH Clock-In failed', 'danger');
          },
        });
      },
      error: () => this.showToast('WFH check failed', 'danger'),
    });
  }

  // ================= HELPERS =================

  generateDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(today.setDate(diff));

    this.days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      this.days.push(d);
    }
  }

  isToday(day: Date) {
    return day.toDateString() === this.today.toDateString();
  }

  isWeekOffDay(day: Date): boolean {
    const weekday = day.toLocaleDateString('en-US', {
      weekday: 'long',
    }).toLowerCase();
    return this.serverWeekOff.includes(weekday);
  }

  onClockStatusChanged(record: AttendanceRecord) {
    this.record = record;
    this.attendanceRefresh = Date.now(); // trigger refresh
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'log') {
      this.attendanceRefresh = Date.now();
    }
  }

  async wfh() {
    const modal = await this.modalCtrl.create({
      component: WorkFromHomeComponent,
      cssClass: 'side-custom-popup',
      backdropDismiss: false,
    });
    await modal.present();
  }

  async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    await toast.present();
  }
}
