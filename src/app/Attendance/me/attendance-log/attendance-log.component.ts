import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

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

  /* UI */
  selectedPeriod = '30DAYS';
  monthButtons: string[] = [];
  currentMonthreport: any[] = [];

  showPopover = false;
  popoverEvent: any;
  selectedLog: any = null;

  /* Date */
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  startDate = `${this.currentYear}-${this.currentMonth}-1`;
  endDate = `${this.currentYear}-${this.currentMonth}-31`;

  private refreshInterval: any;

  constructor(
    private attendanceService: AttendanceService,
    private routeGuard: RouteGuardService,
    private attendanceApi: AttendanceApiService
  ) {
    this.generateMonthButtons();
  }

  ngOnInit(): void {
    this.loadMonthlyReport();
  }

  ngOnDestroy(): void {
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
      next: res => { this.currentMonthreport = res.attendance || [], console.log('Monthly Report Data:', this.currentMonthreport); },
      error: () => this.currentMonthreport = []
    });


  }

  /* ================= FILTER ================= */

  filterByPeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadAllAttendanceData();
  }

  getMonthName(period: string): string {
    const map: any = {
      JAN: 'January', FEB: 'February', MAR: 'March',
      APR: 'April', MAY: 'May', JUN: 'June',
      JUL: 'July', AUG: 'August', SEP: 'September',
      OCT: 'October', NOV: 'November', DEC: 'December'
    };
    return map[period] || period;
  }

  generateMonthButtons(): void {
    const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const current = new Date().getMonth();

    this.monthButtons = [];
    for (let i = 0; i < 6; i++) {
      let idx = current - 1 - i;
      if (idx < 0) idx += 12;
      this.monthButtons.push(monthAbbr[idx]);
    }
  }

  /* ================= ATTENDANCE ================= */

  loadAllAttendanceData(): void {
    const employeeId = this.routeGuard.employeeID;
    if (!employeeId) return;

    const range = this.getDateRange(this.selectedPeriod);

    this.attendanceService.getallattendace({
      employee_id: employeeId,
      startDate: range.start,
      endDate: range.end,
    }).subscribe();
  }

  getDateRange(period: string): { start: string; end: string } {
    const today = new Date();

    if (period === '30DAYS') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      return {
        start: past.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      };
    }

    const map: any = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
    const target = map[period];
    const year = target > today.getMonth() ? today.getFullYear() - 1 : today.getFullYear();

    return {
      start: new Date(year, target, 1).toISOString().split('T')[0],
      end: new Date(year, target + 1, 0).toISOString().split('T')[0],
    };
  }

  /* ================= POPOVER ================= */

  openLogDetails(event: any, log: any): void {
    event.stopPropagation();

    // force reset
    this.closePopover();

    setTimeout(() => {
      this.popoverEvent = event;
      this.selectedLog = log;
      this.showPopover = true;
      this.loadLogDetails(log);
    }, 0);
  }

  private loadLogDetails(log: any): void {
    const employeeId = this.routeGuard.employeeID;
    if (!employeeId) return;

    const fetch = () => {
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
    };

    fetch();

    this.refreshInterval = setInterval(() => {
      if (this.showPopover) fetch();
      else clearInterval(this.refreshInterval);
    }, 3000);
  }

  closePopover(): void {
    this.showPopover = false;
    this.selectedLog = null;
    this.popoverEvent = null;

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
