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

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-work-track',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements OnInit {

  workTrackForm!: FormGroup;
  loading = false;

  myTimesheets: any[] = [];
  loadingList = false;

  today = this.formatDate(new Date());

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadMyTimesheets();
  }

  /* ================= FORM ================= */

  initForm() {
    this.workTrackForm = this.fb.group({
      date: [this.today, Validators.required], // ✅ AUTO TODAY
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

  /* ================= EXCEL ================= */

  downloadExcel(timesheet: any) {
    const rows = timesheet.hours_breakdown.map((b: any) => ({
      Date: timesheet.date,
      Time: b.hour,
      Task: b.task,
      Hours: b.hours,
      Notes: timesheet.notes,
      Total: timesheet.total_hours,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = { Sheets: { Data: ws }, SheetNames: ['Data'] };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), `Timesheet_${timesheet.date}.xlsx`);
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
