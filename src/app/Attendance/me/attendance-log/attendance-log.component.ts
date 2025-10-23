import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CandidateService, Candidate } from 'src/app/services/pre-onboarding.service';
import { AttendanceService, AttendanceRecord, AttendanceEvent } from 'src/app/services/attendance.service';
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
  selector: 'app-attendance-log',
  templateUrl: './attendance-log.component.html',
  styleUrls: ['./attendance-log.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AttendanceLogComponent implements OnInit {
  employee?: Candidate;
  record?: AttendanceRecord;

  breakMinutes: number = 60;
  effectiveHours: string = '0h 0m';
  grossHours: string = '0h 0m';
  timeSinceLastLogin: string = '0h 0m 0s';
  status: string = 'Absent';

  currentTime: string = '';
  currentDate: string = '';
  history: AttendanceEvent[] = [];
  selectedRange: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' = 'TODAY';
  progressValue: number = 0.85;

  activeTab: string = 'log';
  currentMonth: Date = new Date();
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  // calendarDays: any[] = []; 
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
    const storedData = localStorage.getItem("attendanceRecord");
    if (storedData) {
      const allAttendance = JSON.parse(storedData);
      const constAttendance = {
        ...allAttendance,
        clockInTime: allAttendance.clockInTime ? new Date(allAttendance.clockInTime) : null
      }
      console.log(constAttendance, "ALL sATTENDANCE");
    } else {
      console.warn("No attendance record found in localStorage");
    }



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
            { in: '12:13:29', out: '13:25:47' },
          ],
          webClockIn: { in: '09:19:14', out: 'MISSING' },
        },
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
          logs: [{ in: '09:10:00', out: '14:30:00' }],
        },
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
          logs: [{ in: '09:20:00', out: '18:15:00' }],
        },
      },
    ];

    this.generateCalendar(this.currentMonth);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

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
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      this.calendarDays.push({ day: '', timing: '', isOff: false });
    }
    for (let day = 1; day <= lastDate; day++) {
      let timing = '9:30 AM - 6:30 PM';
      let isOff = false;
      const d = new Date(year, month, day).getDay();
      if (d === 0 || d === 6) {
        timing = '';
        isOff = true;
      }

      this.calendarDays.push({
        day, timing, isOff,
        date: new Date(year, month, day)
      });
    }
  }
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Initialize attendance log component
   * Get current employee and set up attendance record subscription
   * Get current employee's attendance record
   * Set up attendance requests history
   * Generate days for calendar
   */
  /*******  bf79ddf5-f32a-460a-b35a-d7bbc24975f6  *******/
  ngOnInit() {
    this.employee = this.candidateService.getCurrentCandidate() || undefined;
    if (!this.employee) return;
    this.attendanceService.record$.subscribe(record => {
      if (record && record.employeeId === this.employee?.id) {
        this.record = record;
        this.updateTimes();
        this.loadHistory();
      }
    });
    this.attendanceService.getRecord(this.employee.id);

    setInterval(() => {
      this.updateTimes();
      this.loadHistory();
    }, 1000);
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
            lastAction: 'ABC on 26 Aug',
          }
        ]
      },
      {
        type: 'Regularization Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [] // none
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
            lastAction: 'ABC on 19 Aug',
          },
          {
            date: '22 Aug 2025',
            request: 'Remote Clock In',
            requestedOn: '22 Aug 2025 by Employee',
            note: 'Working on some issues.',
            status: 'Approved',
            lastAction: 'ABC on 22 Aug',
          }
        ]
      },
      {
        type: 'Partial Day Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: []
      }
    ];
    // Requests Data
    this.attendanceRequests = [
      {
        type: 'Work From Home / On Duty Requests',
        dateRange: '09 Aug 2025 - 22 Sep 2025',
        items: []
      },
      {
        type: 'Regularization Requests',
        dateRange: '09 Aug 2025 - 22 Sep 2025',
        items: ['Request #101 | Pending Approval']
      },
      {
        type: 'Remote Clock In Requests',
        dateRange: '09 Aug 2025 - 22 Sep 2025',
        items: []
      },
      {
        type: 'Partial Day Requests',
        dateRange: '09 Aug 2025 - 22 Sep 2025',
        items: []
      }
    ];

    // Logs Data (with details included)


    this.generateDays();

  }

  generateDays() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const firstDayOfWeek = new Date(today.setDate(diff));
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      this.days.push(date);
    }
  }

  isTodayCalendarDay(cd: CalendarDay): boolean {
    if (!cd.date) return false;
    return (cd.date.getDate() === this.today.getDate() &&
      cd.date.getMonth() === this.today.getMonth() &&
      cd.date.getFullYear() === this.today.getFullYear()
    );
  }

  isToday(day: Date): boolean {
    return (
      day.getDate() === this.today.getDate() &&
      day.getMonth() === this.today.getMonth() &&
      day.getFullYear() === this.today.getFullYear()
    );
  }


  get employeeName(): string {
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

    const today = this.currentDate;
    const dailyMs = this.record.dailyAccumulatedMs?.[today] || 0;

    // Total gross = all accumulated today + ongoing session
    let totalMs = dailyMs;
    let sessionMs = 0;
    if (this.record.isClockedIn && this.record.clockInTime) {
      sessionMs = now.getTime() - new Date(this.record.clockInTime).getTime();
      totalMs += sessionMs;
    }

    // Session timer since last login
    this.timeSinceLastLogin = this.formatHMS(sessionMs);

    // Gross hours today
    const grossMinutes = Math.floor(totalMs / 60000);
    this.grossHours = this.formatHoursMinutes(grossMinutes);

    const effectiveMinutes = Math.max(grossMinutes - this.breakMinutes, 0);
    this.effectiveHours = this.formatHoursMinutes(effectiveMinutes);

    // Status: Present if any accumulated hours today
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

  formatHoursMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  formatHMS(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }


}