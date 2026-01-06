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

  myProjectTimesheets: any[] = [];
  loadingProjectList = false;

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {

  }

  ngOnInit() {
    this.initForm();
    this.checkAssignmentOrFallback(); // ✅ NEW

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
        // ✅ LOAD TIMESHEETS ON PAGE ENTER
        if (this.hasProject) {
          this.loadMyProjectTimesheets();
        } else {
          this.loadMyTimesheets();
        }
      },
      error: () => {
        // ✅ FALLBACK TO REGULAR
        this.hasProject = false;
        this.timesheetType = 'regular';
        this.loadingStatus = false;
        // ✅ LOAD REGULAR TIMESHEETS
        this.loadMyTimesheets();
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


  loadMyProjectTimesheets() {
    if (!this.hasProject || !this.assignments?.length) {
      return;
    }

    this.loadingProjectList = true;

    const projectId = this.assignments[0].project_id;

    this.timesheetService.getMyProjectTimesheets({
      project_id: projectId,
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      month: 1,
      year: 2026
    }).subscribe({
      next: (res: any) => {
        console.log('Project Timesheets 👉', res);
        this.myProjectTimesheets = res?.data || res || [];
        this.loadingProjectList = false;
      },
      error: () => {
        this.loadingProjectList = false;
        this.showToast('Failed to load project timesheets');
      }
    });
  }
  /* ================= SUBMIT ================= */

  submit() {
    if (this.workTrackForm.invalid) {
      this.showToast('Please fill all required fields');
      return;
    }

    const basePayload = {
      date: this.workTrackForm.value.date,
      hours_breakdown: this.workTrackForm.value.hours_breakdown,
      total_hours: this.calculateTotalHours(),
      notes: this.workTrackForm.value.notes,
    };

    this.loading = true;

    /* ================= PROJECT TIMESHEET ================= */
    if (this.hasProject) {

      const projectPayload = {
        ...basePayload,
        project_id: this.assignments?.[0]?.project_id,   // ✅ from assignment API
        work_description: this.workTrackForm.value.notes // API expects this
      };

      this.timesheetService.submitProjectTimesheet(projectPayload).subscribe({
        next: () => {
          this.loading = false;
          this.showToast('Project work submitted successfully');
          this.resetForm();
          this.loadMyProjectTimesheets();
        },
        error: () => {
          this.loading = false;
          this.showToast('Failed to submit project work');
        },
      });

      return;
    }

    /* ================= REGULAR TIMESHEET ================= */
    this.timesheetService.submitRegularTimesheet(basePayload).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Timesheet submitted successfully');
        this.resetForm();
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to submit timesheet');
      },
    });
  }
  resetForm() {
    this.workTrackForm.reset({ date: this.today });
    this.breakdowns.clear();
    this.addRow();
    this.loadMyTimesheets();
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
