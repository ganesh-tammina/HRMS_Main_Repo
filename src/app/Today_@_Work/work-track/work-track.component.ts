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
  rows: any[] = [];
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
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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
    this.http.get<any>('https://30.0.0.78:3562/api/timesheet').subscribe(data => {
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

  monthlybtn() {
    this.calculateWeeklyAndMonthly();
    setTimeout(() => this.loadCharts(), 200);
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
  
    // Build table rows as HTML
    let tableRows = '';
  
    entry.forEach((h: any, index: number) => {
      tableRows += `
        <tr>
          <td colspan="1">${index + 1}</td>
          <td colspan="5">${h.task || '-'}</td>
          <td colspan="1">${h.start_time || '-'}</td>
          <td colspan="1">${h.end_time || '-'}</td>
          <td colspan="1">${h.project || '-'}</td>
        </tr>
      `;
    });
  
    const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8" />
      <style>
        table {
          border-collapse: collapse;
          font-family: Arial;
          font-size: 16px;
          width: 100%;
        }
        td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: middle;
          font-size: 16px;          
          width: 80px;
        }
        .label {
          background: #00568F;
          font-weight: bold;
          text-align: left;
          color: #ffffff;
          font-size: 16px;
        }
      </style>
    </head>
  
    <body>
      <table>
  
        <!-- HEADER -->
        <tr>
          <td class="label" colspan="1">S.No</td>
          <td class="label" colspan="5">Task</td>
          <td class="label" colspan="1">Start Time</td>
          <td class="label" colspan="1">End Time</td>
          <td class="label" colspan="1">Project</td>
        </tr>
  
        <!-- DATA ROWS -->
        ${tableRows}
  
      </table>
    </body>
    </html>
    `;
  
    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DailyReport_${date}.xls`; // use .xls for HTML-based Excel
    link.click();
  }

  exportMonthlyReport(report: any) {
    if (!report) return;
  
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
    const statusColors: any = {
      'P': '#92D050',
      'V': '#00B0F0',
      'L': '#FFC000',
      'C': '#7030A0',
      'H': '#FF0000'
    };
  
    const dayHeaderHtml = days
      .map(d => `<td class="day-header">${d}</td>`)
      .join('');
  
    const dayValuesHtml = days
      .map(d => {
        const val = report['day' + d] || '-';
        const bg = statusColors[val] || '#FFFFFF';
        return `<td style="background:${bg};text-align:center;">${val}</td>`;
      })
      .join('');
  
    const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8" />
      <style>
        table {
          border-collapse: collapse;
          font-family: Arial;
          font-size: 14px;
        }
        td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: middle;
        }
        .center { text-align: center; }
        .label {
          background: #D9D9D9;
          font-weight: bold;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }
        .day-header {
          background: #CCFFCC;
          font-weight: bold;
          text-align: center;
          width: 32px;
        }
        .summary {
          background: #EFEFEF;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
  
    <body>
      <table>
  
        <!-- MAIN HEADER -->
        <tr>
          <td colspan="12"></td>
          <td colspan="8" class="title">CONSULTANT TIMESHEET</td>
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- HEADER DETAILS -->
        <tr>
          <td class="label" colspan="4">Time Sheet of Month:</td>
          <td colspan="8">${report.time_sheet_month}</td>
          <td class="label" colspan="4">Project Name:</td>
          <td colspan="15">${report.project_name}</td>
        </tr>
  
        <tr>
          <td class="label" colspan="4">Consultant / Temp ID:</td>
          <td colspan="8">${report.consultant_name} / ${report.consultant_temp_id}</td>
          <td class="label" colspan="4">Manager:</td>
          <td colspan="15">${report.manager_name}</td>
        </tr>
  
        <tr>
          <td class="label" colspan="4">Business Unit:</td>
          <td colspan="8">${report.business_unit}</td>
          <td class="label" colspan="4">Location:</td>
          <td colspan="15">${report.location}</td>
        </tr>
  
        <tr>
          <td class="label" colspan="4">Start Date of Consultant:</td>
          <td colspan="8">${this.formatDate(report.start_date_of_consultant)}</td>
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- DAYS -->
        <tr>
          ${dayHeaderHtml}
        </tr>
  
        <tr>
          ${dayValuesHtml}
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- LEGEND -->
        <tr>
        <td class="summary" colspan="5">
        LEGEND
        </td>
          <td colspan="26">
            V-Weekend, P-Present, L-Leave, C-Comp Off, H-Holiday
          </td>
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- SUMMARY -->
        <tr>
          <td class="summary" colspan="5">Days Worked</td><td>${report.days_worked}</td>
          <td class="summary" colspan="5">Leaves</td><td>${report.leaves}</td>
          <td class="summary" colspan="6">Comp Offs</td><td>${report.comp_offs}</td>
          <td class="summary" colspan="5">Holidays</td><td>${report.holidays}</td>
          <td class="summary" colspan="5">Weekends</td><td>${report.weekends}</td>
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- REMARKS -->
        <tr>
          <td class="label" colspan="5">Remarks:</td>
          <td colspan="26">${report.remarks || ''}</td>
        </tr>
  
        <tr><td colspan="31"></td></tr>
  
        <!-- SIGNATURES -->
        <tr>
        <td class="label" colspan="5">Signature of the Consultant</td><td colspan="8"></td>
        <td colspan="5"></td>
        <td class="label" colspan="5">Signature of the Manager</td><td colspan="8"></td>
        </tr>
        <tr>
        <td class="label" colspan="5">Date</td><td colspan="8"></td>
        <td colspan="5"></td>
        <td class="label" colspan="5">Date</td><td colspan="8"></td>
        </tr>
  
      </table>
    </body>
    </html>
    `;
  
    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Timesheet_${report.consultant_name}_${report.time_sheet_month}.xls`;
    link.click();
  }
  

  exportDay(date: string) {
    if (!this.allReports[date]) return;
 
    const rows: any[] = [];
 
    // ROW 1 (Name - Date)
    rows.push([
      "Name",
      "M.Siva Devi Ganesh",
      "Date",
      this.formatDate(date)
    ]);
 
    // ROW 2 (Technology - Duration)
    rows.push([
      "Technology",
      this.technologies.join(", "),
      "Duration (HH:MI to)",
      ""
    ]);
 
    rows.push([]); // spacing
 
    // TABLE HEADER
    rows.push(["Sl. No", "Work Completed", "From", "To"]);
 
    // TABLE ROWS
    this.allReports[date].forEach((item: any, index: number) => {
      const workText = item.task || "";
      rows.push([
        index + 1,
        workText.replace(/\n/g, "\n"), // multi-line support
        item.start_time,
        item.end_time
      ]);
    });
 
    const ws: any = XLSX.utils.aoa_to_sheet(rows);
 
    // ───────────────────
    // MERGE CELLS (like screenshot)
    // ───────────────────
    ws["!merges"] = [
      // Row 1
      // { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, // Merge Name value
      // { s: { r: 0, c: 5 }, e: { r: 0, c: 5 } }, // Date value stays single
 
      // Row 2
      // { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } }, // Merge Technology value
      // { s: { r: 1, c: 5 }, e: { r: 1, c: 5 } }  // Duration right cell
    ];
 
    // BOLD HEADERS
    const boldCells = ["A1", "A2", "E1", "E2", "A4", "B4", "C4", "D4"];
 
    // APPLY STYLE: Borders + Bold + WrapText
    const range = XLSX.utils.decode_range(ws["!ref"]);
 
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const ref = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[ref];
        if (!cell) continue;
 
        cell.s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          },
          alignment: {
            wrapText: true,
            vertical: "top"
          }
        };
 
        if (boldCells.includes(ref)) {
          cell.s.font = { bold: true };
        }
      }
    }
 
    // Column widths
    ws["!cols"] = [
      { wch: 10 },  // Sl. No
      { wch: 60 },  // Work Completed
      { wch: 15 },  // From
      { wch: 15 },  // To
      { wch: 20 },  // Date/Duration header
      { wch: 20 }
    ];
 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");
 
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
    this.downloadExcel(buf, `Work_Report_${this.formatDate(date)}.xlsx`);
  }

    exportDaily() { this.exportDay(this.selectedDate); }
 
  exportWeekly() {
    const rows: any[] = [];
    const weekDates = this.getWeekDates();
    weekDates.forEach(d => {
      const saved = localStorage.getItem(d);
      if (saved) {
        JSON.parse(saved).hours.forEach((h: any) => {
          rows.push({ Date: d, Hour: h.hour, Task: h.task || '-', Project: h.project || '-' });
        });
      } else rows.push({ Date: d, Hour: '-', Task: 'No Report', Project: '-' });
    });
    rows.push({ Date: '', Hour: '', Task: 'WEEK TOTAL', Project: this.weeklyTotal });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.downloadExcel(buffer, `Weekly_Report_${this.selectedDate}.xlsx`);
  }
 
  exportMonthly() {
    const rows: any[] = [];
    const month = this.selectedDate.substring(0, 7);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(month)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        data.hours.forEach((h: any) => {
          if (h.type === 'work') rows.push({ Date: key, Hour: h.hour, Task: h.task || '-', Project: h.project || '-' });
        });
      }
    });
    rows.push({ Date: '', Hour: '', Task: 'MONTH TOTAL', Project: this.monthlyTotal });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Report');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.downloadExcel(buffer, `Monthly_Report_${month}.xlsx`);
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
