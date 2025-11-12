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
export class AttendanceLogComponent implements OnInit, OnDestroy, ViewWillEnter {
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

    // Listen for clock actions and refresh data immediately
    this.attendanceService.response$.subscribe(response => {
      if (response && response.data) {
        console.log('Clock action detected, refreshing attendance logs...');
        // Immediate refresh for today specifically
        const today = new Date().toISOString().split('T')[0];
        this.attendanceService.getallattendace({
          employee_id: this.abcd.employeeID,
          date: today
        }).subscribe(data => {
          if (data && data.attendance) {
            this.updateTodayLog(data.attendance, today);
          }
        });
        // Also refresh all data
        setTimeout(() => {
          this.loadAllAttendanceData();
        }, 500);
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
          const date = record.attendance_date;

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

          // Calculate arrival time based on first clock-in
          const allCheckIns = log.records
            .map((rec: any) => rec.check_in)
            .filter((time: any) => time !== null && time !== undefined)
            .sort();
          
          if (allCheckIns.length > 0) {
            const firstClockIn = allCheckIns[0];
            const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
            const standardTime = new Date('1970-01-01T09:30:00');
            
            if (clockInTime <= standardTime) {
              arrivalTime = 'On Time';
            } else {
              const diffMs = clockInTime.getTime() - standardTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
              arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
            }
          } else {
            arrivalTime = '-';
          }
          
          log.records.forEach((rec: any) => {
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

        // Always ensure today's date is included with real-time data
        const today = new Date().toISOString().split('T')[0];
        const todayIndex = this.attendanceLogss.findIndex(log => log.attendance_date === today);
        
        if (todayIndex === -1) {
          // Add today's entry if it doesn't exist
          this.attendanceLogss.unshift({
            attendance_date: today,
            records: [],
            gross: '0h 0m',
            effective: '0h 0m',
            arrival: '-',
            progress: 0
          });
        } else {
          // Update today's arrival time if it has records but shows '-'
          const todayLog = this.attendanceLogss[todayIndex];
          if (todayLog.records.length > 0 && todayLog.arrival === '-') {
            const clockInTimes = todayLog.records
              .filter((rec: any) => rec.check_in)
              .map((rec: any) => rec.check_in)
              .sort();
            
            if (clockInTimes.length > 0) {
              const firstClockIn = clockInTimes[0];
              const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
              const standardTime = new Date('1970-01-01T09:30:00');
              
              if (clockInTime <= standardTime) {
                todayLog.arrival = 'On Time';
              } else {
                const diffMs = clockInTime.getTime() - standardTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                todayLog.arrival = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
              }
            }
          }
        }
        
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
        const date = record.attendance_date;

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

        // Calculate arrival time based on first clock-in
        const clockInTimes = log.records
          .filter((rec: any) => rec.check_in)
          .map((rec: any) => rec.check_in)
          .sort();
        
        if (clockInTimes.length > 0) {
          const firstClockIn = clockInTimes[0];
          const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
          const standardTime = new Date('1970-01-01T09:30:00');
          
          if (clockInTime <= standardTime) {
            arrivalTime = 'On Time';
          } else {
            const diffMs = clockInTime.getTime() - standardTime.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
          }
        } else {
          arrivalTime = '-';
        }
        
        log.records.forEach((rec: any) => {
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

      // Always ensure today's date is included with real-time data
      const today = new Date().toISOString().split('T')[0];
      const todayIndex = this.attendanceLogss.findIndex(log => log.attendance_date === today);
      
      if (todayIndex === -1) {
        this.attendanceLogss.unshift({
          attendance_date: today,
          records: [],
          gross: '0h 0m',
          effective: '0h 0m',
          arrival: '-',
          progress: 0
        });
      } else {
        // Update today's arrival time if it has records
        const todayLog = this.attendanceLogss[todayIndex];
        if (todayLog.records.length > 0) {
          const clockInTimes = todayLog.records
            .filter((rec: any) => rec.check_in)
            .map((rec: any) => rec.check_in)
            .sort();
          
          if (clockInTimes.length > 0) {
            const firstClockIn = clockInTimes[0];
            const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
            const standardTime = new Date('1970-01-01T09:30:00');
            
            if (clockInTime <= standardTime) {
              todayLog.arrival = 'On Time';
            } else {
              const diffMs = clockInTime.getTime() - standardTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
              todayLog.arrival = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
            }
          }
        }
      }
      
      // Sort by date (newest first)
      this.attendanceLogss.sort((a, b) => new Date(b.attendance_date).getTime() - new Date(a.attendance_date).getTime());
      
      console.log('Updated attendance logs:', this.attendanceLogss);
    });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  ionViewWillEnter() {
    console.log('Attendance log view entered, refreshing data...');
    this.loadAllAttendanceData();
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
    // Always fetch fresh data for the specific date when log icon is clicked
    const logDate = (log as any).attendance_date;
    
    this.attendanceService.getallattendace({
      employee_id: this.abcd.employeeID,
      date: logDate
    }).subscribe({
      next: (data) => {
        if (data && data.attendance && data.attendance.length > 0) {
          const updatedRecords = data.attendance.map((item: any) => ({
            check_in: item.check_in,
            check_out: item.check_out,
            arrival_time: item.arrival_time
          }));
          
          // Calculate fresh arrival time
          let arrivalTime = '-';
          const clockInTimes = updatedRecords
            .filter((rec: any) => rec.check_in)
            .map((rec: any) => rec.check_in)
            .sort();
          
          if (clockInTimes.length > 0) {
            const firstClockIn = clockInTimes[0];
            const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
            const standardTime = new Date('1970-01-01T09:30:00');
            
            if (clockInTime <= standardTime) {
              arrivalTime = 'On Time';
            } else {
              const diffMs = clockInTime.getTime() - standardTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
              arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
            }
          }
          
          const updatedLog = {
            ...log,
            records: updatedRecords,
            arrival: arrivalTime
          };
          this.selectedLog = updatedLog;
        } else {
          this.selectedLog = log;
        }
        this.showPopover = true;
      },
      error: () => {
        this.selectedLog = log;
        this.showPopover = true;
      }
    });
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

  private refreshTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const currentEmployeeId = this.abcd.employeeID;
    
    if (!currentEmployeeId) return;
    
    console.log('🔄 Refreshing today\'s attendance data immediately...');
    
    this.attendanceService.getallattendace({
      employee_id: currentEmployeeId,
      date: today
    }).subscribe({
      next: (data) => {
        console.log('📅 Today\'s fresh data:', data);
        
        if (data && data.attendance && data.attendance.length > 0) {
          const todayRecords = data.attendance.map((item: any) => ({
            check_in: item.check_in,
            check_out: item.check_out
          }));
          
          // Calculate today's stats
          let totalMinutes = 0;
          let arrivalTime = '-';
          
          const clockInTimes = todayRecords
            .filter((rec: any) => rec.check_in)
            .map((rec: any) => rec.check_in)
            .sort();
          
          if (clockInTimes.length > 0) {
            const firstClockIn = clockInTimes[0];
            const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
            const standardTime = new Date('1970-01-01T09:30:00');
            
            if (clockInTime <= standardTime) {
              arrivalTime = 'On Time';
            } else {
              const diffMs = clockInTime.getTime() - standardTime.getTime();
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
              arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
            }
          }
          
          // Calculate work time
          todayRecords.forEach((rec: any) => {
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
          
          // Update today's entry in the logs
          const todayIndex = this.attendanceLogss.findIndex(log => log.attendance_date === today);
          
          const todayLog = {
            attendance_date: today,
            records: todayRecords,
            gross: grossHours,
            effective: effectiveHours,
            arrival: arrivalTime,
            progress: Math.min(totalMinutes / 480, 1)
          };
          
          if (todayIndex >= 0) {
            this.attendanceLogss[todayIndex] = todayLog;
          } else {
            this.attendanceLogss.unshift(todayLog);
          }
          
          console.log('✅ Today\'s attendance updated:', todayLog);
        }
      },
      error: (err) => {
        console.error('❌ Error refreshing today\'s attendance:', err);
      }
    });
  }

  private updateTodayLog(attendanceData: any[], date: string) {
    const todayRecords = attendanceData.map((item: any) => ({
      check_in: item.check_in,
      check_out: item.check_out
    }));
    
    let totalMinutes = 0;
    let arrivalTime = '-';
    
    const clockInTimes = todayRecords
      .filter((rec: any) => rec.check_in)
      .map((rec: any) => rec.check_in)
      .sort();
    
    if (clockInTimes.length > 0) {
      const firstClockIn = clockInTimes[0];
      const clockInTime = new Date(`1970-01-01T${firstClockIn}`);
      const standardTime = new Date('1970-01-01T09:30:00');
      
      if (clockInTime <= standardTime) {
        arrivalTime = 'On Time';
      } else {
        const diffMs = clockInTime.getTime() - standardTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        arrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} late`;
      }
    }
    
    todayRecords.forEach((rec: any) => {
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
    
    const todayIndex = this.attendanceLogss.findIndex(log => log.attendance_date === date);
    const todayLog = {
      attendance_date: date,
      records: todayRecords,
      gross: grossHours,
      effective: effectiveHours,
      arrival: arrivalTime,
      progress: Math.min(totalMinutes / 480, 1)
    };
    
    if (todayIndex >= 0) {
      this.attendanceLogss[todayIndex] = todayLog;
    } else {
      this.attendanceLogss.unshift(todayLog);
    }
    
    console.log('✅ Today\'s log updated immediately:', todayLog);
  }

}
