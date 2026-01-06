import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonicModule,
  ToastController,
  ModalController,
} from '@ionic/angular';

import { TimesheetService } from 'src/app/services/timesheets.service';
import { TimesheetPreviewComponent } from './timesheet-preview.component';

@Component({
  selector: 'app-work-track',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements OnInit {

  /* ================= EXISTING ================= */
  workTrackForm!: FormGroup;
  loading = false;

  myTimesheets: any[] = [];
  loadingList = false;

  today = this.formatDate(new Date());

  /* ================= ASSIGNMENT STATE ================= */
  loadingStatus = true;
  hasProject = false;
  assignments: any[] = [];
  timesheetType: 'regular' | 'project' = 'regular'; // fallback default

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.initForm();
    this.checkAssignmentOrFallback(); // ✅ NEW
    this.loadMyTimesheets();
  }

  /* ================= ASSIGNMENT CHECK ================= */

  checkAssignmentOrFallback() {
    this.loadingStatus = true;

    this.timesheetService.getAssignmentStatus().subscribe({
      next: (res: any) => {
        console.log('Assignment API Output 👉', res);
        this.hasProject = res.has_project;
        this.timesheetType = res.timesheet_type;
        this.assignments = res.assignments || [];
        this.loadingStatus = false;
      },
      error: () => {
        // ✅ FALLBACK TO REGULAR
        this.hasProject = false;
        this.timesheetType = 'regular';
        this.loadingStatus = false;
      }
    });
  }

  /* ================= FORM ================= */

  initForm() {
    this.workTrackForm = this.fb.group({
      date: [this.today, Validators.required],
      hours_breakdown: this.fb.array([]),
      notes: [''],
    });

    this.addRow();
  }

  get breakdowns(): FormArray {
    return this.workTrackForm.get('hours_breakdown') as FormArray;
  }

  addRow() {
    this.breakdowns.push(
      this.fb.group({
        hour: ['', Validators.required],
        task: ['', Validators.required],
        hours: [1, [Validators.required, Validators.min(0.5)]],
      })
    );
  }

  removeRow(i: number) {
    if (this.breakdowns.length > 1) {
      this.breakdowns.removeAt(i);
    }
  }

  calculateTotalHours(): number {
    return this.breakdowns.controls.reduce(
      (sum, row) => sum + Number(row.get('hours')?.value || 0),
      0
    );
  }

  /* ================= SUBMIT ================= */

  submit() {
    if (this.workTrackForm.invalid) {
      this.showToast('Please fill all required fields');
      return;
    }

    const payload = {
      ...this.workTrackForm.value,
      total_hours: this.calculateTotalHours(),
    };

    this.loading = true;

    this.timesheetService.submitRegularTimesheet(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Timesheet submitted successfully');
        this.workTrackForm.reset({ date: this.today });
        this.breakdowns.clear();
        this.addRow();
        this.loadMyTimesheets();
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to submit timesheet');
      },
    });
  }

  /* ================= PREVIEW ================= */

  async openPreview(timesheet: any) {
    const modal = await this.modalCtrl.create({
      component: TimesheetPreviewComponent,
      cssClass: 'side-custom-popup view-work-log',
      componentProps: { data: timesheet },
    });
    await modal.present();
  }

  /* ================= LOAD LIST ================= */

  loadMyTimesheets() {
    this.loadingList = true;

    this.timesheetService.getMyRegularTimesheets({}).subscribe({
      next: (res: any) => {
        this.myTimesheets = res?.data || res || [];
        this.loadingList = false;
      },
      error: () => {
        this.loadingList = false;
        this.showToast('Failed to load timesheets');
      },
    });
  }

  /* ================= DOWNLOAD EXCEL (UNCHANGED) ================= */

  downloadExcel(timesheet: any) {
    if (!timesheet || !timesheet.hours_breakdown?.length) {
      return;
    }

    let tableRows = '';

    timesheet.hours_breakdown.forEach((b: any, index: number) => {
      tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td>${b.hour || '-'}</td>
          <td>${b.task || '-'}</td>
          <td>${b.hours || '-'}</td>
        </tr>
      `;
    });

    const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8" />
    </head>
    <body>
      <table border="1">
        <tr><td>Date</td><td colspan="3">${timesheet.date}</td></tr>
        <tr>
          <th>S.No</th><th>Time</th><th>Task</th><th>Hours</th>
        </tr>
        ${tableRows}
        <tr><td>Note</td><td colspan="3">${timesheet.notes || '-'}</td></tr>
        <tr><td>Total</td><td colspan="3">${timesheet.total_hours}</td></tr>
      </table>
    </body>
    </html>
    `;

    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Timesheet_${timesheet.date}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /* ================= UTILS ================= */

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
