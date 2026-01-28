import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AttendanceService } from 'src/app/services/attendance.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { AttendanceApiService } from '../../../services/attendance-api.service';
import { LeaverequestService, MyLeave } from 'src/app/services/leaverequest.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { WeeklyOffPolicyService, WeeklyOffPolicy } from 'src/app/services/weekly-off-policy.service';

@Component({
  selector: 'app-attendance-log',
  standalone: true,
  templateUrl: './attendance-log.component.html',
  styleUrls: ['./attendance-log.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class AttendanceLogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() refreshTrigger: any;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.reloadAttendance();
    }
  }

  /* ================= UI ================= */
  selectedPeriod = '30DAYS';
  monthButtons: string[] = [];
  currentMonthreport: any[] = [];

  showSlider = false;
  selectedLog: any = null;

  /* ================= DATE ================= */
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  startDate = `${this.currentYear}-${this.currentMonth}-1`;
  endDate = `${this.currentYear}-${this.currentMonth}-31`;

  todayPunches: any[] = [];

  /* ================= INTERNAL ================= */
  private refreshInterval: any;
  private routeSub!: Subscription;
  leaveDaysMap: Map<string, string> = new Map(); // date string -> leave type


  employeeProfile: any = null;
  weeklyOffPolicy: WeeklyOffPolicy | null = null;



  constructor(
    private attendanceService: AttendanceService,
    private routeGuard: RouteGuardService,
    private attendanceApi: AttendanceApiService,
    private leaveService: LeaverequestService,
    private employeeService: EmployeeService,
    private weeklyOffPolicyService: WeeklyOffPolicyService,
    private router: Router
  ) {
    this.reloadAttendance();
  }

  private resetState(): void {
    this.currentMonthreport = [];
    this.todayPunches = [];
    this.selectedLog = null;
    this.showSlider = false;

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /* =================================================
   * 🔄 THIS IS THE KEY FIX
   * Reload data every time route becomes active
   * ================================================= */
  ngOnInit(): void {
    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.reloadAttendance();
      });
  }

  ionViewWillEnter(): void {
    this.ngOnInit();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private getAllDatesBetween(start: string, end: string): string[] {
    const dates: string[] = [];
    const startDate = new Date(start);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    // Only show up to today or endDate, whichever is earlier
    const finalEndDate = endDate > today ? today : endDate;
    for (
      let d = new Date(startDate);
      d <= finalEndDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(this.formatDateOnly(d));
    }
    return dates;
  }

  private formatDateOnly(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /* ================= CORE RELOAD ================= */

  private reloadAttendance(): void {
    console.log('🔄 Reloading attendance data');
    this.resetState();
    // 1. Fetch employee profile
    this.employeeService.getMyProfile().subscribe({
      next: (profile) => {
        this.employeeProfile = profile;
        const weeklyOffPolicyId = profile?.weekly_off_policy_id;
        if (weeklyOffPolicyId) {
          // 2. Fetch weekly off policy
          this.weeklyOffPolicyService.getWeeklyOffPolicies().subscribe({
            next: (policies) => {
              this.weeklyOffPolicy = policies.find(p => p.id === weeklyOffPolicyId) || null;
              this.loadLeaveDaysAndMonthlyReport();
            },
            error: () => {
              this.weeklyOffPolicy = null;
              this.loadLeaveDaysAndMonthlyReport();
            }
          });
        } else {
          this.weeklyOffPolicy = null;
          this.loadLeaveDaysAndMonthlyReport();
        }
      },
      error: () => {
        this.employeeProfile = null;
        this.weeklyOffPolicy = null;
        this.loadLeaveDaysAndMonthlyReport();
      }
    });
    this.loadTodayAttendance();
  }

  /**
   * Force reload employee profile and week off policy from server
   * Call this after HR updates employee profile (e.g. after modal save)
   */
  refreshEmployeeProfileAndWeekOff() {
    this.employeeService.getMyProfile(true).subscribe({
      next: (profile) => {
        this.employeeProfile = profile;
        const weeklyOffPolicyId = profile?.weekly_off_policy_id;
        if (weeklyOffPolicyId) {
          this.weeklyOffPolicyService.getWeeklyOffPolicies().subscribe({
            next: (policies) => {
              this.weeklyOffPolicy = policies.find(p => p.id === weeklyOffPolicyId) || null;
              this.loadLeaveDaysAndMonthlyReport();
            },
            error: () => {
              this.weeklyOffPolicy = null;
              this.loadLeaveDaysAndMonthlyReport();
            }
          });
        } else {
          this.weeklyOffPolicy = null;
          this.loadLeaveDaysAndMonthlyReport();
        }
      },
      error: () => {
        this.employeeProfile = null;
        this.weeklyOffPolicy = null;
        this.loadLeaveDaysAndMonthlyReport();
      }
    });
  }

  /**
   * Loads leave days for the current year, then loads the monthly report and merges leave/weekend info.
   */
  private loadLeaveDaysAndMonthlyReport(): void {
    this.leaveService.getMyLeaves(this.currentYear).subscribe({
      next: (leaves: MyLeave[]) => {
        console.log('All leaves fetched from backend:', leaves);
        this.leaveDaysMap = new Map();
        const approvedLeaves = leaves.filter(l => (l.status || '').toUpperCase() === 'APPROVED');
        const approvedLeaveDates: { date: string, type: string }[] = [];
        approvedLeaves.forEach(leave => {
          // Use type_name or type_code for badge, and start_date/end_date for date range
          const leaveType = leave.type_name || leave.type_code || leave.leave_type || 'Leave';
          const fromRaw = leave.start_date || leave.from_date;
          const toRaw = leave.end_date || leave.to_date || fromRaw;
          const fromDateString = fromRaw ? fromRaw : new Date().toISOString();
          const toDateString = toRaw ? toRaw : fromDateString;
          const from = new Date(fromDateString);
          const to = new Date(toDateString);
          let d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
          const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
          while (d <= end) {
            const dateStr = this.formatDateOnly(d);
            this.leaveDaysMap.set(dateStr, leaveType);
            approvedLeaveDates.push({ date: dateStr, type: leaveType });
            d.setDate(d.getDate() + 1);
          }
        });
        console.log('Approved leave days for badge:', approvedLeaveDates);
        console.log('leaveDaysMap for badge:', Array.from(this.leaveDaysMap.entries()));
        this.loadMonthlyReport();
      },
      error: () => {
        this.leaveDaysMap = new Map();
        this.loadMonthlyReport();
      }
    });
  }

  /* ================= REPORT ================= */

  loadMonthlyReport(): void {
    this.attendanceApi.getMonthlyReport({
      startDate: this.startDate,
      endDate: this.endDate,
      month: this.currentMonth,
      year: this.currentYear,
    }).subscribe({
      next: res => {
        const apiAttendance = res?.attendance || [];
        const attendanceMap = new Map<string, any>();
        apiAttendance.forEach((item: any) => {
          const dateKey = this.formatDateOnly(item.attendance_date);
          attendanceMap.set(dateKey, item);
        });
        const allDates = this.getAllDatesBetween(this.startDate, this.endDate);
        // Determine week off days from policy
        const weekOffDays: number[] = [];
        if (this.weeklyOffPolicy) {
          if (this.weeklyOffPolicy.sunday_off) weekOffDays.push(0);
          if (this.weeklyOffPolicy.monday_off) weekOffDays.push(1);
          if (this.weeklyOffPolicy.tuesday_off) weekOffDays.push(2);
          if (this.weeklyOffPolicy.wednesday_off) weekOffDays.push(3);
          if (this.weeklyOffPolicy.thursday_off) weekOffDays.push(4);
          if (this.weeklyOffPolicy.friday_off) weekOffDays.push(5);
          if (this.weeklyOffPolicy.saturday_off) weekOffDays.push(6);
        }
        this.currentMonthreport = allDates.map(date => {
          const existing = attendanceMap.get(date);
          const day = new Date(date).getDay();
          const leaveType = this.leaveDaysMap.get(date);
          const isWeekOff = weekOffDays.includes(day);
          if (leaveType) {
            return {
              attendance_date: date,
              effective_hours: null,
              gross_hours: null,
              status: 'on-leave',
              leaveType: leaveType,
              records: [],
              noLogs: true
            };
          } else if (isWeekOff) {
            return {
              attendance_date: date,
              effective_hours: null,
              gross_hours: null,
              status: 'weekend',
              leaveType: 'Full day week off',
              records: [],
              noLogs: true
            };
          } else if (existing) {
            return existing;
          } else {
            return {
              attendance_date: date,
              effective_hours: null,
              gross_hours: null,
              status: 'absent',
              records: [],
              noLogs: true
            };
          }
        });
        this.currentMonthreport.reverse();
        this.attendanceService.setMonthlyReport(this.currentMonthreport);
        console.log('✅ Normalized monthly report:', this.currentMonthreport);
      },
      error: () => {
        this.currentMonthreport = [];
      }
    });
  }


  loadTodayAttendance(): void {
    this.attendanceApi.getTodayAttendance().subscribe({
      next: res => {
        this.todayPunches = res?.punches || [];
        console.log('Today Punches:', this.todayPunches);
      },
      error: () => {
        this.todayPunches = [];
      }
    });
  }

  filterByPeriod(period: string): void {
    this.selectedPeriod = period;
  }

  /* ================= SLIDER ================= */

  openLogDetails(log: any): void {
    const today = new Date().toDateString();
    const logDate = new Date(log.attendance_date).toDateString();

    console.log('📋 Opening log details:');
    console.log('  - Today:', today);
    console.log('  - Log Date:', logDate);
    console.log('  - Is Today:', today === logDate);
    console.log('  - Today Punches Available:', this.todayPunches.length);

    if (today === logDate && this.todayPunches.length) {
      // ✅ Use today punches (already loaded)
      console.log('✅ Using today punches (fresh data)');
      console.log('  - Raw Punches:', JSON.stringify(this.todayPunches, null, 2));

      const mappedRecords = this.mapPunches(this.todayPunches);
      console.log('  - Mapped Records:', JSON.stringify(mappedRecords, null, 2));

      this.selectedLog = {
        attendance_date: log.attendance_date,
        records: mappedRecords,
      };
    } else {
      // ✅ Load logs by date from API
      console.log('📡 Loading logs from API (past date)');
      this.selectedLog = log;
      this.loadLogDetails(log);
    }

    this.showSlider = true;
  }

  closeSlider(): void {
    this.showSlider = false;
    this.selectedLog = null;

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /* ================= DATA ================= */

  private loadLogDetails(log: any): void {
    if (!log?.attendance_date) return;

    const formattedDate = this.formatDateOnly(log.attendance_date);

    console.log('📅 Fetching logs for:', formattedDate);

    this.attendanceApi.getAttendanceDetailsByDate(formattedDate).subscribe({
      next: (res) => {
        const punches = res?.punches || [];

        this.selectedLog = {
          ...log,
          records: this.mapPunches(punches),
        };
      },
      error: (err) => {
        console.error('❌ Failed to load attendance details', err);

        this.selectedLog = {
          ...log,
          records: [],
        };
      }
    });
  }

  private mapPunches(punches: any[]): any[] {
    console.log('🗺️ Mapping punches:', JSON.stringify(punches, null, 2));

    const records: any[] = [];
    let current: any = null;

    punches.forEach(p => {
      console.log('  Processing punch:', p.punch_type, 'work_mode:', p.work_mode);

      // Always treat remote punch-in as work_mode: 'Remote' if location or notes indicate remote
      let isRemote = (p.work_mode === 'Remote') || (p.location && p.location.toLowerCase().includes('remote')) || (p.notes && p.notes.toLowerCase().includes('remote'));

      if (p.punch_type === 'in') {
        current = {
          check_in: p.punch_time,
          check_out: null,
          work_mode: isRemote ? 'Remote' : (p.work_mode || 'Office'),
          location: p.location,
          notes: p.notes,
          approved: p.approved !== undefined ? p.approved : undefined // map approved property if present
        };
        records.push(current);
        console.log('    ✅ Created record:', current);
      }

      if (p.punch_type === 'out' && current) {
        current.check_out = p.punch_time;
        console.log('    ✅ Updated with check_out:', current);
        current = null;
      }
    });

    console.log('🎯 Final mapped records:', JSON.stringify(records, null, 2));
    return records;
  }

  // Separate office and WFH records based on location
  getOfficeRecords(records: any[]): any[] {
    const officeRecs = records.filter(r => {
      const location = r.location?.toLowerCase() || '';
      const isOffice = location.includes('office') || location.includes('mumbai');
      return isOffice || (r.work_mode === 'Office' && !location.includes('home'));
    });
    console.log('🏢 Office Records:', officeRecs);
    return officeRecs;
  }

  getWFHRecords(records: any[]): any[] {
    const wfhRecs = records.filter(r => {
      const location = r.location?.toLowerCase() || '';
      const isHome = location.includes('home') || r.work_mode === 'WFH';
      return isHome && !location.includes('office');
    });
    console.log('🏠 WFH Records:', wfhRecs);
    return wfhRecs;
  }

  /**
   * Returns all remote records, both approved and pending, for display.
   * Adds a note for pending approval.
   */
  getRemoteRecords(records: any[]): any[] {
    const remoteRecs = records.filter(r => {
      const location = r.location?.toLowerCase() || '';
      return r.work_mode === 'Remote' && !location.includes('home') && !location.includes('office');
    }).map(r => {
      // If not approved, add waiting note
      if (r.approved !== true) {
        return {
          ...r,
          notes: (r.notes ? r.notes + ' | ' : '') + '',
          pendingApproval: true
        };
      }
      return { ...r, pendingApproval: false };
    });
    console.log('🌐 Remote Records (all):', remoteRecs);
    return remoteRecs;
  }

  getArrivalStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      present: 'On Time',
      absent: 'Absent',
      'half-day': 'Half Day',
      late: 'Late Arrival',
      'on-leave': 'On Leave',
    };

    return statusMap[status] || 'Unknown';
  }
}
