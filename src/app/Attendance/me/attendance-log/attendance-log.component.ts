import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AttendanceService } from 'src/app/services/attendance.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { AttendanceApiService } from '../../../services/attendance-api.service';

@Component({
  selector: 'app-attendance-log',
  standalone: true,
  templateUrl: './attendance-log.component.html',
  styleUrls: ['./attendance-log.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class AttendanceLogComponent implements OnInit, OnDestroy {

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

  constructor(
    private attendanceService: AttendanceService,
    private routeGuard: RouteGuardService,
    private attendanceApi: AttendanceApiService,
    private router: Router
  ) { }

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

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /* ================= CORE RELOAD ================= */

  private reloadAttendance(): void {
    console.log('🔄 Reloading attendance data');

    this.resetState();
    this.loadMonthlyReport();
    this.loadTodayAttendance();
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

  /* ================= REPORT ================= */

  loadMonthlyReport(): void {
    this.attendanceApi.getMonthlyReport({
      startDate: this.startDate,
      endDate: this.endDate,
      month: this.currentMonth,
      year: this.currentYear,
    }).subscribe({
      next: res => {
        this.currentMonthreport = res?.attendance || [];
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

    if (today === logDate && this.todayPunches.length) {
      this.selectedLog = {
        attendance_date: log.attendance_date,
        records: this.mapPunches(this.todayPunches),
      };
    } else {
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
    const employeeId = this.routeGuard.employeeID;
    if (!employeeId) return;

    this.attendanceService.getallattendace({
      employee_id: employeeId,
      date: log.attendance_date,
    }).subscribe({
      next: res => {
        const data = res.attendance?.[0];
        if (data?.attendance?.length) {
          this.selectedLog = {
            ...log,
            records: data.attendance.map((r: any) => ({
              check_in: r.check_in,
              check_out: r.check_out,
            }))
          };
        }
      }
    });
  }

  private mapPunches(punches: any[]): any[] {
    const records: any[] = [];
    let current: any = null;

    punches.forEach(p => {
      if (p.punch_type === 'in') {
        current = {
          check_in: p.punch_time,
          check_out: null
        };
        records.push(current);
      }

      if (p.punch_type === 'out' && current) {
        current.check_out = p.punch_time;
        current = null;
      }
    });

    return records;
  }
}
