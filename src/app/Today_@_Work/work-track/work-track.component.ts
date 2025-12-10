import { Component, AfterViewInit } from '@angular/core';
import { IonicModule, PopoverController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { workTrack, WorkTrackService } from '../work-track.service';
import { HttpClient } from '@angular/common/http';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { ClientTimesheetPopoverComponent } from '../client-timesheet-popover/client-timesheet-popover.component';

@Component({
  selector: 'app-work-track-tabs',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements AfterViewInit {
  allReports: any;
  clientTimesheet: any[] = [];
  show: boolean = true;
  activeTab: 'daily' | 'weekly' | 'monthly' = 'daily';
  today = new Date().toISOString().split('T')[0];
  selectedDate = this.today;
  showCalendar = false;
  employee_id = localStorage.getItem('employee_id') || '0';
  techInput = '';
  technologies: string[] = [];
  originalHours: any[] = [
    { start_time: '10:00 AM', end_time: '11:00 AM', task: '', project: '', type: 'work' },
    { start_time: '11:00 AM', end_time: '12:00 PM', task: '', project: '', type: 'work' },
    { start_time: '12:00 PM', end_time: '1:00 PM', task: '', project: '', type: 'work' },
    { start_time: '1:00 PM', end_time: '2:00 PM', task: '', project: '', type: 'work' },
    { start_time: '2:00 PM', end_time: '3:00 PM', task: '', project: '', type: 'break' },
    { start_time: '3:00 PM', end_time: '4:00 PM', task: '', project: '', type: 'work' },
    { start_time: '4:00 PM', end_time: '5:00 PM', task: '', project: '', type: 'work' },
    { start_time: '5:00 PM', end_time: '6:00 PM', task: '', project: '', type: 'work' },
    { start_time: '6:00 PM', end_time: '7:00 PM', task: '', project: '', type: 'work' }
  ];
  hours = JSON.parse(JSON.stringify(this.originalHours));
  dailyTotal = 0;
  weeklyTotal = 0;
  monthlyTotal = 0;
  dailyChart: any;
  weeklyChart: any;
  monthlyChart: any;
  selectedPeriod: string = '30DAYS';
  monthButtons: string[] = [];

  constructor(
    private candidateService: CandidateService,
    private workTrackService: WorkTrackService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    // Load all daily reports
    const allData: workTrack = { employee_id: parseInt(this.employee_id), date: '' };
    this.workTrackService.getAllReport(allData).subscribe((response: any) => {
      this.allReports = response.data.date;
    });

    this.generateMonthButtons();

    // Load client timesheets
    this.http.get<any>('https://localhost:3562/api/timesheet').subscribe(data => {
      this.clientTimesheet = data;
      console.log('Client Timesheet Data:', this.clientTimesheet);
    });
  }

  ngAfterViewInit() {
    this.loadDayData();
    this.calculateWeeklyAndMonthly();
    this.loadCandidateById();
    setTimeout(() => this.loadCharts(), 300);
  }

  // -------------------- MODAL & POPOVER -----------------------
  async openClientTimeSheet() {
    const modal = await this.modalCtrl.create({
      component: ClientTimesheetPopoverComponent,
      cssClass: 'big-modal'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) console.log('Timesheet Submitted:', data);
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  closePopover() {
    const popover = document.querySelector('ion-popover');
    if (popover) (popover as any).dismiss();
  }

  openMissedCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value.split('T')[0];
    this.showCalendar = false;
    this.loadDayData();
    this.calculateWeeklyAndMonthly();
    setTimeout(() => this.loadCharts(), 200);
  }

  // -------------------- DAILY FORM -----------------------
  addTechnology() {
    if (this.techInput.trim()) {
      this.technologies.push(this.techInput.trim());
      this.techInput = '';
    }
  }

  removeTechnology(i: number) {
    this.technologies.splice(i, 1);
  }

  submitDaily() {
    if (this.technologies.length === 0) {
      alert('❌ Please add at least one technology');
      return;
    }
    const workHours = this.hours.filter((h: any) => h.type === 'work');
    if (workHours.some((h: any) => !h.task.trim())) {
      alert('❌ Please fill all task descriptions');
      return;
    }
    if (workHours.some((h: any) => !h.project.trim())) {
      alert('❌ Please select project for all work hours');
      return;
    }

    this.dailyTotal = workHours.filter((h: any) => h.task.trim() !== '').length;

    const data = {
      employee_id: this.employee_id,
      date: this.selectedDate,
      total: this.dailyTotal,
      technologies: this.technologies,
      hours: this.hours
    };

    this.workTrackService.submitReport(data).subscribe({
      next: () => {
        localStorage.setItem(this.selectedDate, JSON.stringify(data));
        this.refreshReports();
        this.calculateWeeklyAndMonthly();
        this.loadCharts();
        this.show = false;
        alert(`✅ Report saved for ${this.selectedDate}`);
        this.resetDailyForm();
      },
      error: (error) => {
        console.error('Error saving report:', error);
        alert('❌ Error saving report: ' + error.error.error);
      }
    });

    this.closePopover();
  }

  resetDailyForm() {
    this.technologies = [];
    this.techInput = '';
    this.dailyTotal = 0;
    this.hours = this.originalHours.map(h => ({ ...h, task: '', project: '' }));
    this.showCalendar = false;
  }

  loadDayData() {
    const saved = localStorage.getItem(this.selectedDate);
    if (saved) {
      const data = JSON.parse(saved);
      this.technologies = data.technologies || [];
      this.dailyTotal = data.total || 0;
      this.hours = data.hours || this.hours;
    } else {
      this.resetDailyForm();
    }
  }

  getWeekDates() {
    const curr = new Date(this.selectedDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));
    const week = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  }

  calculateWeeklyAndMonthly() {
    const weekDates = this.getWeekDates();
    this.weeklyTotal = 0;
    weekDates.forEach(date => {
      const saved = localStorage.getItem(date);
      if (saved) this.weeklyTotal += Number(JSON.parse(saved).total) || 0;
    });

    this.monthlyTotal = 0;
    const monthPrefix = this.selectedDate.substring(0, 7);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(monthPrefix)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        this.monthlyTotal += Number(data.total) || 0;
      }
    });
  }

  // -------------------- CHARTS -----------------------
  loadCharts() {
    const dtx: any = document.getElementById('dailyChart');
    if (dtx) {
      if (this.dailyChart) this.dailyChart.destroy();
      this.dailyChart = new Chart(dtx, {
        type: 'bar',
        data: {
          labels: this.hours.map((h: any) => `${h.start_time}-${h.end_time}`),
          datasets: [{ label: 'Worked', data: this.hours.map((h: any) => h.task ? 1 : 0), borderRadius: 8 }]
        }
      });
    }

    const wtx: any = document.getElementById('weeklyChart');
    if (wtx) {
      if (this.weeklyChart) this.weeklyChart.destroy();
      const weekDates = this.getWeekDates();
      const labels = weekDates.map(d => {
        const date = new Date(d);
        const day = date.toLocaleDateString('en', { weekday: 'short' });
        return `${day}\n${date.getDate()}`;
      });
      const values = weekDates.map(d => localStorage.getItem(d) ? JSON.parse(localStorage.getItem(d)!).total : 0);
      this.weeklyChart = new Chart(wtx, { type: 'line', data: { labels, datasets: [{ label: 'Hours', data: values, tension: 0.4 }] } });
    }

    const mtx: any = document.getElementById('monthlyChart');
    if (mtx) {
      if (this.monthlyChart) this.monthlyChart.destroy();
      this.monthlyChart = new Chart(mtx, {
        type: 'doughnut',
        data: { labels: ['Worked', 'Remaining'], datasets: [{ data: [this.monthlyTotal, Math.max(0, 160 - this.monthlyTotal)] }] }
      });
    }
  }

  // -------------------- EXPORT -----------------------
  private downloadExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }

  exportDailyReport(date: string) {
    const entry = this.allReports[date];
    if (!entry) return;

    const rows: any[] = [];
    rows.push(["Sl. No", "Task", "Start Time", "End Time", "Project"]);

    entry.forEach((h: any, index: number) => {
      rows.push([index + 1, h.task || '-', h.start_time, h.end_time, h.project || '-']);
    });

    const ws: any = XLSX.utils.aoa_to_sheet(rows);
    const wb: any = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    this.downloadExcel(buf, `DailyReport_${date}.xlsx`);
  }

  exportMonthlyReport(report: any) {
    if (!report) return;

    const ws_data: any[][] = [];

    // Empty row
    ws_data.push([]);

    // MAIN HEADER
    ws_data.push(['', '', 'CONSULTANT TIMESHEET']);
    ws_data.push([]);

    // SECTION ROWS (WITH GREY BOXES LATER)
    ws_data.push(['Time Sheet of Month:', report.time_sheet_month, '', '', '', '', 'Project Name:', report.project_name]);
    ws_data.push(['Consultant/ Temp ID:', report.consultant_name + ' / ' + report.consultant_temp_id, '', '', '', '', 'Manager:', report.manager_name]);
    ws_data.push(['Business Unit:', report.business_unit, '', '', '', '', 'Location:', report.location]);
    ws_data.push(['Start Date of Consultant:', this.formatDate(report.start_date_of_consultant)]);
    ws_data.push([]);

    // DAYS HEADER + VALUES
    const dayHeader = [''];
    const dayValues = [''];

    for (let i = 1; i <= 31; i++) {
      dayHeader.push(i.toString());
      dayValues.push(report['day' + i] || '-');
    }

    ws_data.push(dayHeader);
    ws_data.push(dayValues);

    ws_data.push([]);
    ws_data.push(['LEGEND: V-Weekend, P-Present, L-Leave, C-Comp Off, H-Holiday']);
    ws_data.push([]);

    // SUMMARY
    ws_data.push([
      'Days Worked', report.days_worked,
      'Leaves', report.leaves,
      'Comp Offs', report.comp_offs,
      'Holidays', report.holidays,
      'Weekends', report.weekends,
      'TOTAL PAY', report.total_pay
    ]);

    ws_data.push([]);
    ws_data.push(['Remarks:', report.remarks]);
    ws_data.push([]);

    // SIGNATURES
    ws_data.push(['Signature of the consultant', '', '', '', '', '', 'Signature of the Manager']);
    ws_data.push(['Date', '', '', '', '', '', 'Date']);

    // ----------------------------------------------------
    // CREATE WORKSHEET
    // ----------------------------------------------------
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

    // MERGES
    ws['!merges'] = [
      { s: { r: 1, c: 2 }, e: { r: 1, c: 6 } }, // Header
      { s: { r: ws_data.length - 2, c: 0 }, e: { r: ws_data.length - 2, c: 5 } }, // consultant signature
      { s: { r: ws_data.length - 2, c: 6 }, e: { r: ws_data.length - 2, c: 11 } }, // manager signature
      { s: { r: ws_data.length - 1, c: 0 }, e: { r: ws_data.length - 1, c: 5 } },
      { s: { r: ws_data.length - 1, c: 6 }, e: { r: ws_data.length - 1, c: 11 } }
    ];

    // ----------------------------------------------------
    // STYLING DEFINITIONS
    // ----------------------------------------------------
    const headerStyle = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const greyBox = {
      fill: { fgColor: { rgb: "D9D9D9" } },
      font: { bold: true },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // ----------------------------------------------------
    // APPLY STYLES
    // ----------------------------------------------------

    // Main header
    if (ws["C2"]) ws["C2"].s = headerStyle;

    // Apply grey label boxes
    const greyRows = [3, 4, 5, 6]; // rows of labels
    const greyCols = [0, 6];       // columns of labels

    greyRows.forEach(r => {
      greyCols.forEach(c => {
        const cell = XLSX.utils.encode_cell({ r, c });
        if (ws[cell]) ws[cell].s = greyBox;
      });
    });

    // Column widths
    ws["!cols"] = [
      { wpx: 140 },
      { wpx: 160 },
      { wpx: 60 },
      { wpx: 60 },
      { wpx: 60 },
      { wpx: 60 },
      { wpx: 160 },
      { wpx: 120 },
      ...Array(25).fill({ wpx: 35 })
    ];

    // DAY HEADER + VALUES STYLING
    const dayHeaderRow = ws_data.indexOf(dayHeader);
    const dayValueRow = ws_data.indexOf(dayValues);

    for (let c = 1; c <= 31; c++) {
      const hdr = XLSX.utils.encode_cell({ r: dayHeaderRow, c });
      const val = XLSX.utils.encode_cell({ r: dayValueRow, c });

      if (ws[hdr]) ws[hdr].s = { font: { bold: true }, alignment: { horizontal: "center" }, ...borderStyle };
      if (ws[val]) ws[val].s = { alignment: { horizontal: "center" }, ...borderStyle };
    }

    // STATUS COLORS
    const statusColors: any = {
      'P': 'FF92D050', // Green
      'V': 'FF00B0F0', // Blue
      'L': 'FFFFC000', // Orange
      'C': 'FF7030A0', // Purple
      'H': 'FFFF0000'  // Red
    };

    for (let i = 1; i <= 31; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: dayValueRow, c: i });
      const value = report['day' + i];

      if (ws[cellRef] && statusColors[value]) {
        ws[cellRef].s = { fill: { fgColor: { rgb: statusColors[value] } }, alignment: { horizontal: "center" }, ...borderStyle };
      }
    }

    // SUMMARY STYLING
    const summaryRow = ws_data.findIndex(r => r[0] === "Days Worked");

    if (summaryRow !== -1) {
      for (let c = 0; c <= 10; c++) {
        const ref = XLSX.utils.encode_cell({ r: summaryRow, c });
        if (ws[ref]) {
          ws[ref].s = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            ...borderStyle
          };
        }
      }
    }

    // ----------------------------------------------------
    // CREATE & DOWNLOAD WORKBOOK
    // ----------------------------------------------------
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const fileName = `Timesheet_${report.consultant_name}_${report.time_sheet_month}.xlsx`;

    saveAs(new Blob([buf], { type: 'application/octet-stream' }), fileName);
  }


  // -------------------- CANDIDATE & SHIFT -----------------------
  loadCandidateById() {
    const employeeId = localStorage.getItem('employee_id');
    if (!employeeId) return;

    this.candidateService.getEmpDet().subscribe({
      next: (response) => {
        if (response.data && response.data[0]) {
          const employees = response.data[0];
          const currentEmployee = employees.find((emp: any) => emp.employee_id == employeeId);
          if (currentEmployee?.shift_policy_name) {
            this.candidateService.getShiftByName(currentEmployee.shift_policy_name).subscribe({
              next: (shiftData) => {
                this.updateOriginalHours(shiftData.data.check_in, shiftData.data.check_out);
              }
            });
          }
        }
      }
    });
  }

  updateOriginalHours(shift_check_in: string, shift_check_out: string) {
    const startTime = new Date(`1970-01-01T${shift_check_in}`);
    const endTime = new Date(`1970-01-01T${shift_check_out}`);
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    this.originalHours = [];
    for (let i = 0; i < totalHours; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(startTime.getTime() + (i + 1) * 60 * 60 * 1000);
      this.originalHours.push({
        start_time: hourStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        end_time: hourEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        task: '',
        project: '',
        type: i === Math.floor(totalHours / 2) ? 'break' : 'work'
      });
    }
    this.hours = JSON.parse(JSON.stringify(this.originalHours));
  }

  formatDate(date: string): string {
    const dt = new Date(date);
    dt.setDate(dt.getDate() + 1);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    return `${day}-${month}-${year}`;
  }

  generateMonthButtons() {
    const currentMonth = new Date().getMonth();
    const monthAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.monthButtons = [];
    for (let i = 0; i < 6; i++) {
      let monthIndex = currentMonth - 1 - i;
      if (monthIndex < 0) monthIndex += 12;
      this.monthButtons.push(monthAbbr[monthIndex]);
    }
  }

  getReportDates(): string[] {
    if (!this.allReports) return [];
    return Object.keys(this.allReports).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  refreshReports() {
    const allData: workTrack = { employee_id: parseInt(this.employee_id), date: '' };
    this.workTrackService.getAllReport(allData).subscribe((response: any) => {
      this.allReports = response.data.date;
    });
  }
}
