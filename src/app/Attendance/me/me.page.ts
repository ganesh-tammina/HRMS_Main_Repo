import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { CandidateService, Candidate } from '../../services/pre-onboarding.service';
import { AttendanceService, AttendanceRecord, AttendanceEvent } from '../../services/attendance.service';
import { EmployeeHeaderComponent } from './employee-header/employee-header.component';
import { ClockButtonComponent } from '../../services/clock-button/clock-button.component';
import { AttendanceLogComponent } from './attendance-log/attendance-log.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AttendanceRequestComponent } from './attendance-request/attendance-request.component';
import { RadialTimeGraphComponent } from './radial-time-graph/radial-time-graph.component';

interface AttendanceRequest { type: string; dateRange: string; items: string[] }
interface AttendanceRequestHistory { date: string; request: string; requestedOn: string; note: string; reason?: string; status: string; lastAction: string; nextApprover?: string }
interface AttendanceLog { date: string; progress: number; effective: string; gross: string; arrival: string; details: { shift: string; shiftTime: string; location: string; logs: { in: string; out: string }[]; webClockIn?: { in: string; out: string } } }
interface CalendarDay { day: number | ''; timing: string; isOff: boolean; date?: Date }

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
  standalone: true,
  imports: [
    IonicModule, ClockButtonComponent, HeaderComponent, EmployeeHeaderComponent,
    CommonModule, AttendanceLogComponent, CalendarComponent, AttendanceRequestComponent,
    RadialTimeGraphComponent
  ]
})
export class MePage implements OnInit {

  employee?: Candidate;
  record?: AttendanceRecord;
  shiftData?: any;

  shift_check_in = "";
  shift_check_out = "";

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
    private attendanceService: AttendanceService
  ) {
    this.generateCalendar(this.currentMonth);
  }

  // ---------------------------------------------------------
  // 🔥 FIX: load data EVERY TIME page is opened
  // ---------------------------------------------------------
  ionViewWillEnter() {
    console.log("Me Page - ionViewWillEnter");

    // Ensure proper initialization with slight delay for component setup
    setTimeout(() => {
      this.initializePage();
      
      // Force refresh attendance status from server after page load
      const employeeId = localStorage.getItem("employee_id");
      if (employeeId && this.attendanceService) {
        setTimeout(() => {
          this.attendanceService.refreshAttendanceStatus(Number(employeeId));
        }, 200);
      }
    }, 50);
  }

  // ---------------------------------------------------------
  // RUN ONLY ONE-TIME LOGIC HERE
  // ---------------------------------------------------------
  ngOnInit() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: true,
      });
    }, 500);
  }

  // ---------------------------------------------------------
  // 🔥 FULL INITIALIZATION (was inside ngOnInit before)
  // ---------------------------------------------------------
  initializePage() {
    this.loadCandidateById();

    this.employee = this.candidateService.getCurrentCandidate() || undefined;
    if (!this.employee) return;

    this.attendanceService.record$.subscribe(record => {
      if (record && record.employeeId === this.employee?.id) {
        this.record = record;
        this.updateTimes();
        this.loadHistory();
      }
    });

    this.attendanceService.response$.subscribe(response => {
      if (response) {
        console.log('Clock action detected in main page:', response.action);

        if (response.optimistic) {
          this.updateTimes();
          this.loadHistory();
        }

        if (response.confirmed || response.data) {
          // Server confirmed response - immediate update
          console.log('Server response confirmed, updating main page immediately...');
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

    this.initRequestsAndLogs();
    this.generateDays();
  }

  // ------------------------------------------
  // Methods below are unchanged
  // ------------------------------------------

  onClockStatusChanged(record: AttendanceRecord) {
    this.record = record;
    this.updateTimes();
    this.loadHistory();
  }

  setTab(tab: string) { this.activeTab = tab; }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar(this.currentMonth);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
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
      if (d === 0 || d === 6) { timing = ''; isOff = true; }
      this.calendarDays.push({ day, timing, isOff, date: new Date(year, month, day) });
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

  isTodayCalendarDay(cd: CalendarDay) { return cd.date ? cd.date.toDateString() === this.today.toDateString() : false; }
  isToday(day: Date) { return day.toDateString() === this.today.toDateString(); }
  get employeeName() { return this.employee?.personalDetails?.FirstName || ''; }

  openLogDetails(log: AttendanceLog) { this.selectedLog = log; this.showPopover = true; }
  closePopover() { this.showPopover = false; this.selectedLog = null; }

  updateTimes() {
    if (!this.record) return;

    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: true });
    this.currentDate = now.toDateString();

    const dailyMs = this.record.dailyAccumulatedMs?.[this.currentDate] || 0;
    let totalMs = dailyMs;
    let sessionMs = 0;

    if (this.record.isClockedIn && this.record.clockInTime) {
      sessionMs = Math.max(0, now.getTime() - new Date(this.record.clockInTime).getTime());
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
    const rawHistory = this.attendanceService.getHistoryByRange(this.record, this.selectedRange);
    this.history = rawHistory.map(event => ({
      ...event,
      displayTime: new Date(event.time).toLocaleTimeString('en-US', { hour12: true })
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

  private initRequestsAndLogs() {
    this.attendanceRequestsHistory = [
      {
        type: 'Work From Home / On Duty Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [
          {
            date: '26 Aug 2025',
            request: 'Work From Home - 1 Day',
            requestedOn: '26 Aug 2025 12:30 PM by XYZ',
            note: 'working from home on this day.',
            reason: 'Personal',
            status: 'Approved',
            lastAction: 'ABC on 26 Aug'
          }
        ]
      },
      {
        type: 'Regularization Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: []
      },
      {
        type: 'Remote Clock In Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [
          {
            date: '19 Aug 2025',
            request: 'Remote Clock In',
            requestedOn: '19 Aug 2025 by Employee',
            note: 'I am working on some high-priority tasks.',
            status: 'Approved',
            lastAction: 'ABC on 19 Aug'
          },
          {
            date: '22 Aug 2025',
            request: 'Remote Clock In',
            requestedOn: '22 Aug 2025 by Employee',
            note: 'Working on some issues.',
            status: 'Approved',
            lastAction: 'ABC on 22 Aug'
          }
        ]
      },
      {
        type: 'Partial Day Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: []
      }
    ];

    this.attendanceRequests = [
      { type: 'Work From Home / On Duty Requests', dateRange: '09 Aug 2025 - 22 Sep 2025', items: [] },
      { type: 'Regularization Requests', dateRange: '09 Aug 2025 - 22 Sep 2025', items: ['Request #101 | Pending Approval'] },
      { type: 'Remote Clock In Requests', dateRange: '09 Aug 2025 - 22 Sep 2025', items: [] },
      { type: 'Partial Day Requests', dateRange: '09 Aug 2025 - 22 Sep 2025', items: [] }
    ];

    this.attendanceLogs = [
      {
        date: 'Mon, 01 Sept',
        progress: 0.7,
        effective: '6h 44m',
        gross: '8h 42m',
        arrival: 'On Time',
        details: {
          shift: 'Day shift 1 (01 Sept)',
          shiftTime: '9:30 - 18:30',
          location: '4th Floor SVS Towers',
          logs: [
            { in: '09:16:48', out: '12:01:14' },
            { in: '12:13:29', out: '13:25:47' }
          ],
          webClockIn: { in: '09:19:14', out: 'MISSING' }
        }
      },
      {
        date: 'Tue, 02 Sept',
        progress: 0.5,
        effective: '3h 56m',
        gross: '4h 9m',
        arrival: 'On Time',
        details: {
          shift: 'Day shift 1 (02 Sept)',
          shiftTime: '9:30 - 18:30',
          location: '4th Floor SVS Towers',
          logs: [
            { in: '09:10:00', out: '14:30:00' }
          ]
        }
      },
      {
        date: 'Wed, 03 Sept',
        progress: 0.75,
        effective: '6h 38m',
        gross: '8h 46m',
        arrival: 'On Time',
        details: {
          shift: 'Day shift 1 (03 Sept)',
          shiftTime: '9:30 - 18:30',
          location: 'HQ',
          logs: [
            { in: '09:20:00', out: '18:15:00' }
          ]
        }
      }
    ];
  }

  loadCandidateById() {
    const employeeId = localStorage.getItem("employee_id");
    if (employeeId) {
      this.candidateService.getEmpDet().subscribe({
        next: (response) => {
          if (response.data && response.data[0]) {
            const employees = response.data[0];
            const currentEmployee = employees.find((emp: any) => emp.employee_id == employeeId);

            if (currentEmployee) {
              console.log('Found employee details:', currentEmployee);

              if (currentEmployee.shift_policy_name) {
                this.candidateService.getShiftByName(currentEmployee.shift_policy_name).subscribe({
                  next: (shiftData) => {
                    this.shiftData = shiftData;
                    this.shift_check_in = shiftData.data.check_in;
                    this.shift_check_out = shiftData.data.check_out;
                  },
                  error: (error) => {
                    console.error('Error getting shift details:', error);
                  }
                });
              }
            }
          }
        },
        error: (error) => {
          console.error('Error getting employee details:', error);
        }
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
          hour12: true
        });
      } else {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
        return String(val);
      }
    } catch {
      return String(val);
    }
  }
}
