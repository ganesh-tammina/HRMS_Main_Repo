import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TimesheetService } from 'src/app/services/timesheets.service';

/* ✅ FRONTEND EXCEL */
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

  /* ================= CREATE ================= */
  workTrackForm!: FormGroup;
  loading = false;

  /* ================= LIST ================= */
  myTimesheets: any[] = [];
  loadingList = false;

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMyTimesheets();
  }

  /* ================= FORM ================= */

  initForm() {
    this.workTrackForm = this.fb.group({
      date: ['', Validators.required],
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

  removeRow(index: number) {
    this.breakdowns.removeAt(index);
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
      date: this.workTrackForm.value.date,
      hours_breakdown: this.workTrackForm.value.hours_breakdown,
      total_hours: this.calculateTotalHours(),
      notes: this.workTrackForm.value.notes,
    };

    this.loading = true;

    this.timesheetService.submitRegularTimesheet(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Timesheet submitted successfully');
        this.workTrackForm.reset();
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

  /* ================= LOAD LIST ================= */

  loadMyTimesheets() {
    this.loadingList = true;

    this.timesheetService.getMyRegularTimesheets({
      start_date: '2025-12-01',
      end_date: '2025-12-31',
      month: 12,
      year: 2025,
    }).subscribe({
      next: (res) => {
        this.myTimesheets = res?.data || res || [];
        this.loadingList = false;
      },
      error: () => {
        this.loadingList = false;
        this.showToast('Failed to load timesheets');
      },
    });
  }

  /* ================= FRONTEND EXCEL DOWNLOAD ================= */

  downloadExcel(timesheet: any) {

    if (!timesheet.hours_breakdown || !timesheet.hours_breakdown.length) {
      this.showToast('No data to download');
      return;
    }

    const rows: any[] = [];

    timesheet.hours_breakdown.forEach((item: any) => {
      rows.push({
        Date: timesheet.date,
        Time_Slot: item.hour,
        Task: item.task,
        Hours: item.hours,
        Notes: timesheet.notes || '',
        Total_Hours: timesheet.total_hours,
      });
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);

    const workbook: XLSX.WorkBook = {
      Sheets: { Timesheet: worksheet },
      SheetNames: ['Timesheet'],
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const date = timesheet.date?.split('T')[0] || 'Timesheet';
    saveAs(blob, `Timesheet_${date}.xlsx`);
  }

  /* ================= TOAST ================= */

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}
