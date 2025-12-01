import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-work-from-home',
  templateUrl: './work-from-home.component.html',
  styleUrls: ['./work-from-home.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class WorkFromHomeComponent implements OnInit {
  pickerOpen: 'from' | 'to' | null = null;

  fromDate = new Date();
  toDate = new Date();

  displayFromDate = '';
  displayToDate = '';

  totalDays = 1;

  requestType: 'full' | 'custom' = 'full';
  fromSession: 'full' | 'first' | 'second' = 'full';
  toSession: 'full' | 'first' | 'second' = 'full';

  note = '';
  notifyEmployee: any;

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  blankDays: number[] = [];
  monthDays: number[] = [];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(
    private modalCtrl: ModalController,
    private candidateService: CandidateService,
    private routerGaurd: RouteGuardService,
    private https: HttpClient
  ) { }

  ngOnInit() {
    this.updateDisplayDates();
    this.generateCalendar();
    this.calculateDays();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  openPicker(type: 'from' | 'to') {
    this.pickerOpen = this.pickerOpen === type ? null : type;
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    this.blankDays = Array(firstDay).fill(0);
    this.monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  }

  selectDate(day: number) {
    const selected = new Date(this.currentYear, this.currentMonth, day);

    if (this.pickerOpen === 'from') {
      this.fromDate = selected;
    } else {
      this.toDate = selected;
    }

    this.updateDisplayDates();
    this.calculateDays();
    this.pickerOpen = null;
  }

  isSelected(day: number) {
    const d = new Date(this.currentYear, this.currentMonth, day).toDateString();

    if (this.pickerOpen === 'from') {
      return this.fromDate.toDateString() === d;
    }

    if (this.pickerOpen === 'to') {
      return this.toDate.toDateString() === d;
    }

    return false;
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  updateDisplayDates() {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    this.displayFromDate = this.fromDate.toLocaleDateString('en-GB', options);
    this.displayToDate = this.toDate.toLocaleDateString('en-GB', options);
  }

  setType(type: 'full' | 'custom') {
    this.requestType = type;

    if (type === 'full') {
      this.fromSession = 'full';
      this.toSession = 'full';
    } else {
      this.fromSession = 'first';
      this.toSession = 'second';
    }

    this.calculateDays();
  }

  calculateDays() {
    const oneDay = 1000 * 60 * 60 * 24;
    let diff =
      Math.floor((this.toDate.getTime() - this.fromDate.getTime()) / oneDay) +
      1;

    if (diff <= 0) diff = 1;

    if (this.requestType === 'full') {
      this.totalDays = diff;
      return;
    }

    let total = diff;

    if (this.fromSession !== 'full') {
      total -= 0.5;
    }

    if (this.toSession !== 'full') {
      total -= 0.5;
    }

    this.totalDays = total;
  }

  submit() {
    const payload = {
      employee_id: this.routerGaurd.employeeID,
      from_date: this.formatDate(this.fromDate),
      to_date: this.formatDate(this.toDate),
      type: this.requestType,
      from_session: this.fromSession,
      to_session: this.toSession,
      total_days: this.totalDays,
      reason: this.note,
      notify_id: this.selectedNotifyID,
    };
    this.candidateService.requestWorkFromHome(payload).subscribe((res: any) => {
      alert(res.message);
      console.log(res.result);
      if (res.statusCode === 200) {
        this.modalCtrl.dismiss();
      }
    });

  }

  // search controller and displaying function
  results: any;
  searchResults: any;
  selectedNotify: any = null;
  selectedNotifyID: any = null;
  onSearch() {
    if (!this.notifyEmployee || this.notifyEmployee.trim().length === 0) {
      this.searchResults = [];
      return;
    }

    this.candidateService.searchCandidates(this.notifyEmployee).subscribe({
      next: (results: any) => {
        this.searchResults = results.data;
        console.log('Search results:', this.searchResults);
      },
    });
  }
  onSelectNotify(emp: any) {
    // Allow only ONE selection
    if (this.selectedNotify === emp.first_name) {
      this.selectedNotify = null;
      this.selectedNotifyID = emp.employee_id;
    } else {
      this.selectedNotify = emp.first_name;
      this.selectedNotifyID = emp.employee_id;
    }

    this.notifyEmployee = this.selectedNotify;
  }

  formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }
}
