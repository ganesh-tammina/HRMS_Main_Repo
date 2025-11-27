import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { WorkTrackService } from '../work-track.service';
import { CandidateService } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-work-track-tabs',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements AfterViewInit  {

  constructor(
    private candidateService: CandidateService,
    private workTrackService: WorkTrackService
  ) { }
  activeTab: 'daily' | 'weekly' | 'monthly' = 'daily';

  today = new Date().toISOString().split('T')[0];
  selectedDate = this.today;
  showCalendar = false;
  employee_id = localStorage.getItem('employee_id') || '0';
  techInput = '';
  technologies: string[] = [];
  shiftData: any;
  shift_check_in: string = '';
  shift_check_out: string = '';
  week_off_days: string[] = [];

  originalHours = [
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

  ngAfterViewInit() {
    this.loadDayData();
    this.calculateWeeklyAndMonthly();
    this.loadCandidateById();
    setTimeout(() => this.loadCharts(), 300);
   
  }

  changeTab(tab: any) {
    this.activeTab = tab;

    if (tab === 'weekly' || tab === 'monthly') {
      this.calculateWeeklyAndMonthly();
      setTimeout(() => this.loadCharts(), 200);
    }
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
    // Validation
    if (this.technologies.length === 0) {
      alert('❌ Please add at least one technology');
      return;
    }

    const workHours = this.hours.filter((h: any) => h.type === 'work');
    const hasEmptyTask = workHours.some((h: any) => !h.task.trim());
    const hasEmptyProject = workHours.some((h: any) => !h.project.trim());

    if (hasEmptyTask) {
      alert('❌ Please fill all task descriptions');
      return;
    }

    if (hasEmptyProject) {
      alert('❌ Please select project for all work hours');
      return;
    }

    const workedHours = this.hours.filter(
      (h: any) => h.type === 'work' && h.task.trim() !== ''
    ).length;

    this.dailyTotal = workedHours;

    const data = {
      employee_id : this.employee_id,
      date: this.selectedDate,
      total: this.dailyTotal,
      technologies: this.technologies,
      hours: this.hours
    };

    this.workTrackService.submitReport(data).subscribe({
      next: (response) => {
        localStorage.setItem(this.selectedDate, JSON.stringify(data));
        this.calculateWeeklyAndMonthly();
        this.loadCharts();
        alert(`✅ Report saved for ${this.selectedDate}`);
        this.resetDailyForm();
      },
      error: (error) => {
        console.error('Error saving report:', error);
        alert('❌ Error saving report: ' + error.error.error);
      }
    });
  }

  resetDailyForm() {
    this.technologies = [];
    this.techInput = '';
    this.dailyTotal = 0;

    this.hours = this.originalHours.map(h => ({
      ...h,
      task: '',
      project: ''
    }));

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
      this.technologies = [];
      this.dailyTotal = 0;
      this.hours = this.originalHours.map(h => ({
        ...h,
        task: '',
        project: ''
      }));
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

      if (saved) {
        const data = JSON.parse(saved);
        this.weeklyTotal += Number(data.total) || 0;
      }
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

  loadCharts() {

    const dtx: any = document.getElementById('dailyChart');
    if (dtx) {
      if (this.dailyChart) this.dailyChart.destroy();

      this.dailyChart = new Chart(dtx, {
        type: 'bar',
        data: {
          labels: this.hours.map((h: any) => `${h.start_time}-${h.end_time}`),
          datasets: [{
            label: 'Worked',
            data: this.hours.map((h: any) => h.task ? 1 : 0),
            borderRadius: 8
          }]
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

      const values = weekDates.map(d => {
        const s = localStorage.getItem(d);
        return s ? JSON.parse(s).total : 0;
      });

      this.weeklyChart = new Chart(wtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Hours',
            data: values,
            tension: 0.4
          }]
        }
      });
    }

    const mtx: any = document.getElementById('monthlyChart');
    if (mtx) {
      if (this.monthlyChart) this.monthlyChart.destroy();

      this.monthlyChart = new Chart(mtx, {
        type: 'doughnut',
        data: {
          labels: ['Worked', 'Remaining'],
          datasets: [{
            data: [this.monthlyTotal, Math.max(0, 160 - this.monthlyTotal)]
          }]
        }
      });
    }
  }

  exportDaily() {

    const rows: any[] = [];

    this.hours.forEach((h: any) => {
      if (h.type === 'work') {
        rows.push({
          Date: this.selectedDate,
          Hour: h.hour,
          Task: h.task || '-',
          Project: h.project || '-'
        });
      }
    });

    rows.push({
      Date: '',
      Hour: '',
      Task: 'TOTAL HOURS',
      Project: this.dailyTotal
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Report');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.downloadExcel(buffer, `Daily_Report_${this.selectedDate}.xlsx`);
  }

  exportWeekly() {

    const rows: any[] = [];
    const weekDates = this.getWeekDates();

    weekDates.forEach(d => {
      const saved = localStorage.getItem(d);

      if (saved) {
        const data = JSON.parse(saved);

        data.hours.forEach((h: any) => {
          if (h.type === 'work') {
            rows.push({
              Date: d,
              Hour: h.hour,
              Task: h.task || '-',
              Project: h.project || '-'
            });
          }
        });

      } else {
        rows.push({
          Date: d,
          Hour: '-',
          Task: 'No Report',
          Project: '-'
        });
      }
    });

    rows.push({
      Date: '',
      Hour: '',
      Task: 'WEEK TOTAL',
      Project: this.weeklyTotal
    });

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
          if (h.type === 'work') {
            rows.push({
              Date: key,
              Hour: h.hour,
              Task: h.task || '-',
              Project: h.project || '-'
            });
          }
        });
      }
    });

    rows.push({
      Date: '',
      Hour: '',
      Task: 'MONTH TOTAL',
      Project: this.monthlyTotal
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Report');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.downloadExcel(buffer, `Monthly_Report_${month}.xlsx`);
  }

  private downloadExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  }

  loadCandidateById() {
    const employeeId = localStorage.getItem('employee_id');
    if (employeeId) {
      this.candidateService.getEmpDet().subscribe({
        next: (response) => {
          if (response.data && response.data[0]) {
            const employees = response.data[0];
            const currentEmployee = employees.find(
              (emp: any) => emp.employee_id == employeeId
            );

            if (currentEmployee) {
              if (currentEmployee.shift_policy_name) {
                this.candidateService
                  .getShiftByName(currentEmployee.shift_policy_name)
                  .subscribe({
                    next: (shiftData) => {
                      this.shiftData = shiftData;
                      this.shift_check_in = shiftData.data.check_in;
                      this.shift_check_out = shiftData.data.check_out;
                      this.updateOriginalHours();
                      console.log('Loaded shift details:', this.shiftData);
                    },
                    error: (error) => {
                      console.error('Error getting shift details:', error);
                    },
                  });
              }
            }
          }
        },
        error: (error) => {
          console.error('Error getting employee details:', error);
        },
      });
    }
  }

  updateOriginalHours() {
    if (this.shift_check_in && this.shift_check_out) {
      const startTime = new Date(`1970-01-01T${this.shift_check_in}`);
      const endTime = new Date(`1970-01-01T${this.shift_check_out}`);
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
  }
}
