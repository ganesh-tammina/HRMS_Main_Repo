import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CandidateService, Candidate } from 'src/app/services/pre-onboarding.service';
import { AttendanceService, AttendanceRecord, AttendanceEvent } from 'src/app/services/attendance.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
export class AttendanceLogComponent implements OnInit, OnDestroy {
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
  calendarDays: CalendarDay[] = [];
  attendanceRequests: AttendanceRequest[] = [];
  selectedLog: any = null;
  showPopover = false;
  attendanceLogs: any[] = [];
  attendanceLogss: any[] = [];

  attendanceHistory: any = [];
  private employee_det: any;
  days: Date[] = [];
  today: Date = new Date();

  attendanceRequestsHistory: {
    type: string;
    dateRange: string;
    records: AttendanceRequestHistory[];
  }[] = [];

  private routerSubscription?: Subscription;
  private currentEmployeeId: string | null = null;

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService,
    private abcd: RouteGuardService
  ) {
    this.generateCalendar(this.currentMonth);
  }



  ngOnInit() {
    // Load all attendance data immediately
    this.loadAllAttendanceData();
    
    this.employee = this.candidateService.getCurrentCandidate() || undefined;
    if (!this.employee) return;
    console.log('Current Employee:', this.employee);

    this.attendanceService.record$.subscribe(record => {
      if (record && record.employeeId === this.employee?.id) {
        this.record = record;
        this.updateTimes();
        this.loadHistory();
        this.refreshAttendanceLogs();
      }
    });

    this.attendanceService.getRecord(this.employee.id);
    this.generateDays();
    this.attendanceRecord();
  }

  private loadAllAttendanceData() {
    // Wait a bit for employee ID to be available after login
    setTimeout(() => {
      const currentEmployeeId = this.abcd.employeeID;
      if (!currentEmployeeId) {
        console.log('No employee ID found, retrying...');
        setTimeout(() => this.loadAllAttendanceData(), 500);
        return;
      }

      console.log('Loading ALL attendance data for employee:', currentEmployeeId);
      this.fetchAttendanceData(currentEmployeeId);
    }, 100);
  }

  private fetchAttendanceData(employeeId: string) {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 90); // Get last 90 days

    const startDate = pastDate.toISOString().split('T')[0];
    const endDate = currentDate.toISOString().split('T')[0];

    console.log('📅 Fetching attendance from', startDate, 'to', endDate, 'for employee', employeeId);

    this.attendanceService.getallattendace({
      employee_id: employeeId,
      startDate: startDate,
      endDate: endDate
    }).subscribe({
      next: (data) => {
        console.log('📊 ALL Attendance Records:', data);
        
        if (!data || !data.attendance || data.attendance.length === 0) {
          console.log('⚠️ No attendance data found');
          this.attendanceLogss = [];
          return;
        }

        const normalized = data.attendance.map((item: any) => ({
          ...item,
          attendance_date: new Date(item.attendance_date).toISOString().split('T')[0]
        }));

        const groupedByDate: any = {};
        normalized.forEach((record: any) => {
          const dateObj = new Date(record.attendance_date);
          dateObj.setDate(dateObj.getDate() + 1);
          const date = dateObj.toISOString().split('T')[0];

          if (!groupedByDate[date]) {
            groupedByDate[date] = {
              attendance_date: date,
              records: []
            };
          }

          groupedByDate[date].records.push({
            check_in: record.check_in,
            check_out: record.check_out
          });
        });

        this.attendanceLogss = Object.values(groupedByDate).map((log: any) => {
          let totalMinutes = 0;
          let arrivalTime = '';

          log.records.forEach((rec: any, index: number) => {
            if (rec.check_in && index === 0) {
              arrivalTime = rec.check_in;
            }
            if (rec.check_in && rec.check_out) {
              const inTime = new Date(`1970-01-01T${rec.check_in}`);
              const outTime = new Date(`1970-01-01T${rec.check_out}`);
              const diffMinutes = (outTime.getTime() - inTime.getTime()) / 60000;
              totalMinutes += diffMinutes;
            }
          });

          const grossHours = this.formatHoursMinutes(Math.floor(totalMinutes));
          const effectiveMinutes = Math.max(totalMinutes - this.breakMinutes, 0);
          const effectiveHours = this.formatHoursMinutes(Math.floor(effectiveMinutes));

          return {
            ...log,
            gross: grossHours,
            effective: effectiveHours,
            arrival: arrivalTime || '-',
            progress: Math.min(totalMinutes / 480, 1)
          };
        });

        // Sort by date (newest first)
        this.attendanceLogss.sort((a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime());
        
        console.log('📅 Successfully loaded', this.attendanceLogss.length, 'attendance log entries');
        console.log('📊 Attendance logs:', this.attendanceLogss);
      },
      error: (err) => {
        console.error('❌ Error loading attendance data:', err);
        this.attendanceLogss = [];
      }
    });
  }

  refreshAttendanceLogs() {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 30);

    const startDate = pastDate.toISOString().split('T')[0];
    const endDate = currentDate.toISOString().split('T')[0];

    this.attendanceService.getallattendace({
      employee_id: this.abcd.employeeID,
      startDate: startDate,
      endDate: endDate
    }).subscribe((data) => {
      console.log('Refreshed Attendance Records:', data);

      const normalized = data.attendance.map((item: any) => ({
        ...item,
        attendance_date: new Date(item.attendance_date).toISOString().split('T')[0]
      }));

      const groupedByDate: any = {};
      normalized.forEach((record: any) => {
        const dateObj = new Date(record.attendance_date);
        dateObj.setDate(dateObj.getDate() + 1);
        const date = dateObj.toISOString().split('T')[0];

        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            attendance_date: date,
            records: []
          };
        }

        groupedByDate[date].records.push({
          check_in: record.check_in,
          check_out: record.check_out
        });
      });

      this.attendanceLogss = Object.values(groupedByDate).map((log: any) => {
        let totalMinutes = 0;
        let arrivalTime = '';

        log.records.forEach((rec: any, index: number) => {
          if (rec.check_in && index === 0) {
            arrivalTime = rec.check_in;
          }
          if (rec.check_in && rec.check_out) {
            const inTime = new Date(`1970-01-01T${rec.check_in}`);
            const outTime = new Date(`1970-01-01T${rec.check_out}`);
            const diffMinutes = (outTime.getTime() - inTime.getTime()) / 60000;
            totalMinutes += diffMinutes;
          }
        });

        const grossHours = this.formatHoursMinutes(Math.floor(totalMinutes));
        const effectiveMinutes = Math.max(totalMinutes - this.breakMinutes, 0);
        const effectiveHours = this.formatHoursMinutes(Math.floor(effectiveMinutes));

        return {
          ...log,
          gross: grossHours,
          effective: effectiveHours,
          arrival: arrivalTime || '-',
          progress: Math.min(totalMinutes / 480, 1)
        };
      });

      console.log('Updated attendance logs:', this.attendanceLogss);
    });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }



  attendanceRecord() {
    if (!this.employee) return;
    this.attendanceService.clockAction(this.employee, 'in');
  }

  // Calendar generation
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

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar(this.currentMonth);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar(this.currentMonth);
  }

  setTab(tab: string) {
    this.activeTab = tab;
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

    let totalMs = dailyMs;
    let sessionMs = 0;
    if (this.record.isClockedIn && this.record.clockInTime) {
      sessionMs = now.getTime() - new Date(this.record.clockInTime).getTime();
      totalMs += sessionMs;
    }

    this.timeSinceLastLogin = this.formatHMS(sessionMs);
    const grossMinutes = Math.floor(totalMs / 60000);
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
