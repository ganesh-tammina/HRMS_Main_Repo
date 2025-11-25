import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-work-track-tabs',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements AfterViewInit  {

  activeTab: 'daily' | 'weekly' | 'monthly' = 'daily';

  today = new Date().toISOString().split('T')[0];
  selectedDate = this.today;
  showCalendar = false;

  techInput = '';
  technologies: string[] = [];

  originalHours = [
    { hour: '10-11', task: '', project: '', type: 'work' },
    { hour: '11-12', task: '', project: '', type: 'work' },
    { hour: '12-1', task: '', project: '', type: 'work' },
    { hour: '1-2', task: '', project: '', type: 'work' },
    { hour: '2-3', task: '', project: '', type: 'break' },
    { hour: '3-4', task: '', project: '', type: 'work' },
    { hour: '4-5', task: '', project: '', type: 'work' },
    { hour: '5-6', task: '', project: '', type: 'work' },
    { hour: '6-7', task: '', project: '', type: 'work' }
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
    const workedHours = this.hours.filter(
      (h: any) => h.type === 'work' && h.task.trim() !== ''
    ).length;

    this.dailyTotal = workedHours;

    const data = {
      date: this.selectedDate,
      total: this.dailyTotal,
      technologies: this.technologies,
      hours: this.hours
    };

    localStorage.setItem(this.selectedDate, JSON.stringify(data));

    this.calculateWeeklyAndMonthly();
    this.loadCharts();

    alert(`✅ Report saved for ${this.selectedDate}`);

    this.resetDailyForm();
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
          labels: this.hours.map((h: any) => h.hour),
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
}
