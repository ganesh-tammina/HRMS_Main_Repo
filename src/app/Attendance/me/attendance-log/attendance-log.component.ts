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
  ) {
    this.reloadAttendance();
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

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
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
      // ✅ Use today punches (already loaded)
      this.selectedLog = {
        attendance_date: log.attendance_date,
        records: this.mapPunches(this.todayPunches),
      };
    } else {
      // ✅ Load logs by date from API
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
    const records: any[] = [];
    let current: any = null;

    punches.forEach(p => {
      if (p.punch_type === 'in') {
        current = {
          check_in: p.punch_time,
          check_out: null,
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
