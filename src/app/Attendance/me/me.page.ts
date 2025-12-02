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

interface AttendanceRequest {
  type: string;
  dateRange: string;
  items: string[];
}
interface AttendanceRequestHistory {
  date: string;
  request: string;
  requestedOn: string;
  note: string;
  reason?: string;
  status: string;
  lastAction: string;
  nextApprover?: string;
}
interface AttendanceLog {
  date: string;
  progress: number;
  effective: string;
  gross: string;
  arrival: string;
  details: {
    shift: string;
    shiftTime: string;
    location: string;
    logs: { in: string; out: string }[];
    webClockIn?: { in: string; out: string };
  };
}
interface CalendarDay {
  day: number | '';
  timing: string;
  isOff: boolean;
  date?: Date;
}

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
  shiftData?: any;
  one: any;
  shift_policy: any;
  allEmployee: any;
  week_off_days: string[] = [];
  shift_check_in = '';
  shift_check_out = '';
  allEmployees: any;

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
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  allWeekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  serverWeekOff: any;
  calendarDays: CalendarDay[] = [];
  attendanceRequests: AttendanceRequest[] = [];
  selectedLog: AttendanceLog | null = null;
  showPopover = false;
  attendanceLogs: AttendanceLog[] = [];
  days: Date[] = [];
  today: Date = new Date();
  attendanceRequestsHistory: {
    type: string;
    dateRange: string;
    records: AttendanceRequestHistory[];
  }[] = [];

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService,
    private router: RouteGuardService,
    private modalCtrl: ModalController,
    private routeGuardService: RouteGuardService
  ) {
    this.generateCalendar(this.currentMonth);
    this.generateDays();
  }

  // ---------------------------------------------------------
  // 🔥 FIX: load data EVERY TIME page is opened
  // ---------------------------------------------------------
  ionViewWillEnter() {
    console.log('Me Page - ionViewWillEnter');

    // setTimeout(() => {
    //   this.initializePage();
    // }, 50);
  }

  // ---------------------------------------------------------
  // RUN ONLY ONE-TIME LOGIC HERE
  // ---------------------------------------------------------
  ngOnInit() {
    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          if (this.allEmployees.length > 0) {
            this.one = this.allEmployees[0];
            this.shift_policy = this.one[0].shift_policy_name;
          }
        },
        error: (err) => {
          console.error('Error fetching all employees:', err);
        },
      });
      // Subscribe to current candidate observable
      this.custom_do_not_change_until_you_have_solution();
      // Fallback: if page refreshed
    }
  }

  custom_do_not_change_until_you_have_solution() {
    // _function_to_check_clock_in_and_clock_out
    this.attendanceService
      .checkLoginOrLoggedOut(this.routeGuardService.employeeID)
      .subscribe({
        next: (response: any) => {
          // this.shift_check_in = response.shift.check_in;
          // this.shift_check_out = response.shift.check_out;
          this.shift_check_in = this.convertTo12Hour(response.shift.check_in);
          this.shift_check_out = this.convertTo12Hour(response.shift.check_out);
          this.splitWeeks(response.week_off.week_off_days);
        },
      });
  }


    // clock in clock out add 12hrs format 
    convertTo12Hour(time: string): string {
      if (!time) return '';
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
  // ---------------------------------------------------------
  // 🔥 FULL INITIALIZATION (was inside ngOnInit before)
  // ---------------------------------------------------------
  initializePage() {
    this.loadCandidateById();

    this.employee = this.candidateService.getCurrentCandidate() || undefined;
    if (!this.employee) return;

    this.attendanceService.record$.subscribe((record) => {
      if (record && record.employeeId === this.employee?.id) {
        this.record = record;
        this.updateTimes();
        this.loadHistory();
      }
    });

    this.attendanceService.response$.subscribe((response) => {
      if (response) {
        console.log('Clock action detected in main page:', response.action);

        if (response.optimistic) {
          this.updateTimes();
          this.loadHistory();
        }

        if (response.confirmed || response.data) {
          // Server confirmed response - immediate update
          console.log(
            'Server response confirmed, updating main page immediately...'
          );
          this.updateTimes();
          this.loadHistory();

          // Handle force refresh for immediate backend sync
          if (response.forceRefresh) {
            console.log('Force refresh in main page, updating all data...');
            setTimeout(() => {
              this.updateTimes();
              this.loadHistory();
            }, 100);
          }
        }

        if (response.action === 'refresh') {
          // Refresh action - update immediately
          console.log('Refresh detected in main page...');
          this.updateTimes();
          this.loadHistory();
        }

        if (response.error) {
          this.updateTimes();
          this.loadHistory();
        }
      }
    });

    this.attendanceService.getRecord(this.employee.id);

    setInterval(() => {
      this.updateTimes();
      if (new Date().getSeconds() % 5 === 0) {
        this.loadHistory();
      }
    }, 1000);

    // this.initRequestsAndLogs();
  }

  // ------------------------------------------
  // Methods below are unchanged
  // ------------------------------------------

  onClockStatusChanged(record: AttendanceRecord) {
    this.record = record;
    this.updateTimes();
    this.loadHistory();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  prevMonth() {
    this.currentMonth = new Date(
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1)
    );
    this.generateCalendar(this.currentMonth);
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1)
    );
    this.generateCalendar(this.currentMonth);
  }

  generateCalendar(date: Date) {
    this.calendarDays = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++)
      this.calendarDays.push({ day: '', timing: '', isOff: false });

    for (let day = 1; day <= lastDate; day++) {
      let timing = '9:30 AM - 6:30 PM';
      let isOff = false;
      const d = new Date(year, month, day).getDay();
      if (d === 0 || d === 6) {
        timing = '';
        isOff = true;
      }
      this.calendarDays.push({
        day,
        timing,
        isOff,
        date: new Date(year, month, day),
      });
    }
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

  isTodayCalendarDay(cd: CalendarDay) {
    return cd.date
      ? cd.date.toDateString() === this.today.toDateString()
      : false;
  }
  isToday(day: Date) {
    return day.toDateString() === this.today.toDateString();
  }
  get employeeName() {
    return this.employee?.personalDetails?.FirstName || '';
  }

  openLogDetails(log: AttendanceLog) {
    this.selectedLog = log;
    this.showPopover = true;
  }
  closePopover() {
    this.showPopover = false;
    this.selectedLog = null;
  }

  updateTimes() {
    if (!this.record) return;

    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: true });
    this.currentDate = now.toDateString();

    const dailyMs = this.record.dailyAccumulatedMs?.[this.currentDate] || 0;
    let totalMs = dailyMs;
    let sessionMs = 0;

    if (this.record.isClockedIn && this.record.clockInTime) {
      sessionMs = Math.max(
        0,
        now.getTime() - new Date(this.record.clockInTime).getTime()
      );
      totalMs += sessionMs;
    }

    this.timeSinceLastLogin = this.formatHMS(sessionMs);
    const grossMinutes = Math.max(0, Math.floor(totalMs / 60000));
    this.grossHours = this.formatHoursMinutes(grossMinutes);
    const effectiveMinutes = Math.max(grossMinutes - this.breakMinutes, 0);
    this.effectiveHours = this.formatHoursMinutes(effectiveMinutes);
    this.status = totalMs > 0 ? 'Present' : 'Absent';
  }

  loadHistory() {
    if (!this.record) return;
    const rawHistory = this.attendanceService.getHistoryByRange(
      this.record,
      this.selectedRange
    );
    this.history = rawHistory.map((event) => ({
      ...event,
      displayTime: new Date(event.time).toLocaleTimeString('en-US', {
        hour12: true,
      }),
    }));
  }

  changeRange(range: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL') {
    this.selectedRange = range;
    this.loadHistory();
  }

  formatHoursMinutes(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  formatHMS(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  loadCandidateById() {
    const employeeId = localStorage.getItem('employee_id');
    if (employeeId) {
      this.candidateService.getEmpDet().subscribe({
        next: (response) => {
          if (response.data && response.data[0]) {
            const employees = response.data[0];
            const currentEmployee = employees.find(
              (emp: any) => emp.employee_id == employeeId
            );

            if (currentEmployee) {
              console.log('Found employee details:', currentEmployee);

              if (currentEmployee.shift_policy_name) {
                this.candidateService
                  .getShiftByName(currentEmployee.shift_policy_name)
                  .subscribe({
                    next: (shiftData) => {
                      this.shiftData = shiftData;
                      this.shift_check_in = shiftData.data.check_in;
                      this.shift_check_out = shiftData.data.check_out;
                    },
                    error: (error) => {
                      console.error('Error getting shift details:', error);
                    },
                  });
              }

              if (currentEmployee.weekly_off_policy_name) {
                this.candidateService.getAllWeeklyOffPolicies().subscribe({
                  next: (weekoffData) => {
                    console.log('weekOffs: ', weekoffData);

                    const policies = Array.isArray(weekoffData)
                      ? weekoffData
                      : [];

                    console.log('policies: ', policies);

                    const matchedPolicy = policies.find(
                      (p) =>
                        p?.week_off_policy_name?.toLowerCase() ==
                        currentEmployee.weekly_off_policy_name?.toLowerCase()
                    );

                    console.log('Filtered Policy:', matchedPolicy);

                    this.week_off_days =
                      matchedPolicy?.week_off_days?.split(',');
                    console.log('week_off_days: ', this.week_off_days);
                  },
                  error: (error) => {
                    console.error('Error getting shift details:', error);
                  },
                });
              }
            }
          }
        },
        error: (error) => {
          console.error('Error getting employee details:', error);
        },
      });
    }
  }

  trackByDate(index: number, d: Date) {
    return d?.toDateString() || index;
  }

  formatShiftTime(val: string | null): string {
    if (!val) return '';

    try {
      if (/\d{2}:\d{2}(:\d{2})?/.test(val) && !/[T\-]/.test(val)) {
        const [hh, mm] = val.split(':');
        const date = new Date();
        date.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } else {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        }
        return String(val);
      }
    } catch {
      return String(val);
    }
  }
  isWeekOff(day: string): boolean {
    return this.serverWeekOff.includes(day.toLowerCase());
  }
  splitWeeks(weeds: string) {
    const arry = weeds.split(',');

    this.serverWeekOff = arry.map((day) => day.trim().toLowerCase());

    console.log(this.serverWeekOff);
  }

  async wfh() {
    const modal = await this.modalCtrl.create({
      component: WorkFromHomeComponent,
      cssClass: 'wfh-modal',
      backdropDismiss: false,
    });

    await modal.present();
  }


}
