import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';

@Component({
  selector: 'app-work-from-home',
  templateUrl: './work-from-home.component.html',
  styleUrls: ['./work-from-home.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class WorkFromHomeComponent implements OnInit {

  /* ================= DATE PICKER ================= */
  pickerOpen: 'from' | 'to' | null = null;

  fromDate = new Date();
  toDate = new Date();

  displayFromDate = '';
  displayToDate = '';
  validationError = '';

  totalDays = 1;
  isSubmitting = false;

  /* ================= REQUEST TYPE ================= */
  requestType: 'full' | 'custom' = 'full';
  fromSession: 'full' | 'first' | 'second' = 'full';
  toSession: 'full' | 'first' | 'second' = 'full';

  /* ================= FORM DATA ================= */
  note = '';
  notifyEmployee = '';

  /* ================= CALENDAR ================= */
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();

  blankDays: number[] = [];
  monthDays: number[] = [];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private modalCtrl: ModalController,
    private wfhService: WorkFromHomeService,
    private toastCtrl: ToastController
  ) { }

  /* ================= INIT ================= */
  ngOnInit() {
    this.updateDisplayDates();
    this.generateCalendar();
    this.calculateDays();
  }

  /* ================= MODAL ================= */
  close() {
    this.modalCtrl.dismiss();
  }

  /* ================= CALENDAR ================= */
  openPicker(type: 'from' | 'to') {
    this.pickerOpen = this.pickerOpen === type ? null : type;
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

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

  /* ================= TYPE ================= */
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
    const toTime = this.toDate.getTime();
    const fromTime = this.fromDate.getTime();

    if (toTime < fromTime) {
      this.totalDays = 0;
      this.validationError = 'To date cannot be earlier than From date';
      return;
    }

    this.validationError = '';
    let diff = Math.floor((toTime - fromTime) / oneDay) + 1;

    if (diff <= 0) diff = 1;

    if (this.requestType === 'full') {
      this.totalDays = diff;
      return;
    }

    let total = diff;

    if (this.fromSession !== 'full') total -= 0.5;
    if (this.toSession !== 'full') total -= 0.5;

    this.totalDays = total;
  }

  /* ================= SUBMIT ================= */
  submit() {
    // Prevent multiple submissions
    if (this.isSubmitting) return;

    // Validate required fields
    if (!this.note || this.validationError) {
      return;
    }

    // Validate both dates
    if (!this.fromDate || isNaN(this.fromDate.getTime()) || !this.toDate || isNaN(this.toDate.getTime())) {
      const toast = this.toastCtrl.create({
        message: 'Please select valid dates',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      toast.then(t => t.present());
      return;
    }

    // Format the dates
    const startDateStr = this.formatDate(this.fromDate);
    const endDateStr = this.formatDate(this.toDate);

    // Validate formatted dates
    if (!startDateStr || !endDateStr || startDateStr.length === 0 || endDateStr.length === 0) {
      const toast = this.toastCtrl.create({
        message: 'Invalid date format',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
      toast.then(t => t.present());
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      start_date: startDateStr,
      end_date: endDateStr,
      total_days: this.totalDays,
      work_mode: 'WFH',
      reason: this.note,
    };

    console.log('Submitting WFH request with payload:', payload);

    this.wfhService.wfh(payload).subscribe({
      next: async (res: any) => {
        this.isSubmitting = false;
        const toast = await this.toastCtrl.create({
          message: 'Work From Home request submitted successfully',
          duration: 2000,
          color: 'success',
          position: 'top',
        });
        await toast.present();

        this.modalCtrl.dismiss(res, 'success');
      },
      error: async (err: any) => {
        this.isSubmitting = false;
        console.error('WFH request error:', err);

        const errorMessage = err?.error?.error || err?.error?.message || 'Failed to submit WFH request';
        const toast = await this.toastCtrl.create({
          message: errorMessage,
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        await toast.present();
      },
    });
  }

  /* ================= UTIL ================= */
  private formatDate(date: Date): string {
    // Validate input
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date object:', date);
      return '';
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');

    const formatted = `${year}-${month}-${day}`;
    console.log('Formatted date:', formatted, 'from:', date);

    return formatted;
  }
}
