import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
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
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule],
  templateUrl: './work-track.component.html',
  styleUrls: ['./work-track.component.scss'],
})
export class WorkTrackComponent implements OnInit {
  // Client timesheet upload state
  clientUploadFile: File | null = null;
  clientUploadMonth: number = new Date().getMonth() + 1;
  clientUploadYear: number = new Date().getFullYear();
  clientUploadProjectId: number | null = null;
  clientUploadLoading = false;
  /**
   * Handle file input change for client timesheet upload
   */
  onClientUploadFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.clientUploadFile = file;
    }
  }

  /**
   * Upload client timesheet for selected project
   */
  async uploadClientTimesheet(projectId: number) {
    if (!this.clientUploadFile) {
      this.showToast('Please select a file to upload');
      return;
    }
    this.clientUploadLoading = true;
    const formData = new FormData();
    formData.append('file', this.clientUploadFile);
    formData.append('month', this.clientUploadMonth.toString());
    formData.append('year', this.clientUploadYear.toString());
    formData.append('project_id', projectId.toString());
    this.timesheetService.uploadClientTimesheet(formData).subscribe({
      next: (res) => {
        this.clientUploadLoading = false;
        this.showToast(res?.message || 'Client timesheet uploaded successfully');
        this.clientUploadFile = null;
      },
      error: (err) => {
        this.clientUploadLoading = false;
        this.showToast('Failed to upload client timesheet');
      }
    });
  }

  /* ================= EXISTING ================= */
  workTrackForm!: FormGroup;
  loading = false;

  myTimesheets: any[] = [];
  loadingList = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  paginatedTimesheets: any[] = [];

  // Filters
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];
  years: number[] = [];

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
    this.initializeYears();
    this.checkAssignmentOrFallback(); // ✅ NEW - this will call loadMyTimesheets() after assignment is loaded
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
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

        // Initialize first row with shift timing after assignments are loaded
        this.initializeFirstTimeSlot();

        // Load timesheets after assignment status is determined
        this.loadMyTimesheets();
      },
      error: () => {
        // ✅ FALLBACK TO REGULAR
        this.hasProject = false;
        this.timesheetType = 'regular';
        this.loadingStatus = false;

        // Initialize with default timing for regular employees
        this.initializeFirstTimeSlot();

        // Load timesheets after assignment status is determined
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

    // Don't add row here - will be added after getting shift info
  }

  get breakdowns(): FormArray {
    return this.workTrackForm.get('hours_breakdown') as FormArray;
  }

  /* Initialize first time slot based on shift timing */
  initializeFirstTimeSlot() {
    // Clear existing rows
    this.breakdowns.clear();

    let firstTimeSlot = '';

    if (this.hasProject && this.assignments.length > 0) {
      // For project-based employees, use project shift timing
      const assignment = this.assignments[0];
      if (assignment.start_time) {
        firstTimeSlot = this.generateTimeSlot(assignment.start_time);
      }
    } else {
      // For regular employees, use default 09:00 or fetch from attendance shift
      firstTimeSlot = '09:00-10:00';
    }

    // Add first row with calculated time slot
    this.breakdowns.push(
      this.fb.group({
        hour: [firstTimeSlot, Validators.required],
        task: ['', Validators.required],
        hours: [1, [Validators.required, Validators.min(0.5)]],
      })
    );
  }

  /* Generate time slot from start time (e.g., "09:00" -> "09:00-10:00") */
  generateTimeSlot(startTime: string): string {
    if (!startTime) return '';

    try {
      // Parse start time (format: "HH:mm" or "HH:mm:ss")
      const [hours, minutes] = startTime.split(':').map(Number);

      // Calculate end time (1 hour later)
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(hours + 1, minutes, 0, 0);

      // Format as "HH:mm-HH:mm"
      const startStr = this.formatTime(startDate);
      const endStr = this.formatTime(endDate);

      return `${startStr}-${endStr}`;
    } catch (error) {
      console.error('Error generating time slot:', error);
      return '';
    }
  }

  /* Format time as HH:mm */
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  addRow() {
    // Get the last time slot to calculate the next one
    let nextTimeSlot = '';

    if (this.breakdowns.length > 0) {
      const lastRow = this.breakdowns.at(this.breakdowns.length - 1);
      const lastTimeSlot = lastRow.get('hour')?.value;

      if (lastTimeSlot && lastTimeSlot.includes('-')) {
        // Extract END time from last slot as the START time for the new slot
        const endTime = lastTimeSlot.split('-')[1];
        // Calculate next slot with 1 hour duration
        nextTimeSlot = this.generateTimeSlotWithDuration(endTime, 1);
      }
    }

    this.breakdowns.push(
      this.fb.group({
        hour: [nextTimeSlot, Validators.required],
        task: ['', Validators.required],
        hours: [1, [Validators.required, Validators.min(0.5)]],
      })
    );
  }

  /* Update time slots when hours change */
  onHoursChange(index: number) {
    const currentRow = this.breakdowns.at(index);
    const hours = Number(currentRow.get('hours')?.value || 1);
    const currentTimeSlot = currentRow.get('hour')?.value;

    if (currentTimeSlot && currentTimeSlot.includes('-')) {
      // Extract start time and recalculate end time based on hours
      const startTime = currentTimeSlot.split('-')[0];
      const newTimeSlot = this.generateTimeSlotWithDuration(startTime, hours);
      currentRow.patchValue({ hour: newTimeSlot }, { emitEvent: false });

      // Update all subsequent rows
      this.updateSubsequentRows(index);
    }
  }

  /* Update all rows after the changed one */
  updateSubsequentRows(fromIndex: number) {
    for (let i = fromIndex + 1; i < this.breakdowns.length; i++) {
      const prevRow = this.breakdowns.at(i - 1);
      const currentRow = this.breakdowns.at(i);

      const prevTimeSlot = prevRow.get('hour')?.value;

      if (prevTimeSlot && prevTimeSlot.includes('-')) {
        // Get end time from previous slot as start time for current
        const prevEndTime = prevTimeSlot.split('-')[1];
        const currentHours = Number(currentRow.get('hours')?.value || 1);
        const newTimeSlot = this.generateTimeSlotWithDuration(prevEndTime, currentHours);

        currentRow.patchValue({ hour: newTimeSlot }, { emitEvent: false });
      }
    }
  }

  /* Generate time slot with custom duration */
  generateTimeSlotWithDuration(startTime: string, hours: number): string {
    if (!startTime) return '';

    try {
      // Parse start time (format: "HH:mm" or "HH:mm:ss")
      const timeParts = startTime.split(':').map(Number);
      const startHours = timeParts[0];
      const startMinutes = timeParts[1] || 0;

      // Calculate end time based on duration
      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(startDate);
      // Add hours (convert to minutes for precision)
      endDate.setMinutes(startDate.getMinutes() + (hours * 60));

      // Format as "HH:mm-HH:mm"
      const startStr = this.formatTime(startDate);
      const endStr = this.formatTime(endDate);

      return `${startStr}-${endStr}`;
    } catch (error) {
      console.error('Error generating time slot:', error);
      return '';
    }
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
    this.initializeFirstTimeSlot();
    // Delay loading to ensure hasProject is set
    setTimeout(() => this.loadMyTimesheets(), 100);
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

    const filters = {
      month: this.selectedMonth,
      year: this.selectedYear
    };

    // Load project timesheets if user has project, otherwise regular timesheets
    const fetchObservable = this.hasProject
      ? this.timesheetService.getMyProjectTimesheets(filters)
      : this.timesheetService.getMyRegularTimesheets(filters);

    fetchObservable.subscribe({
      next: (res: any) => {
        this.myTimesheets = res?.data || res || [];
        this.currentPage = 1;
        this.updatePagination();
        this.loadingList = false;
      },
      error: () => {
        this.loadingList = false;
        this.showToast('Failed to load timesheets');
      },
    });
  }

  /* ================= PAGINATION ================= */

  updatePagination() {
    this.totalPages = Math.ceil(this.myTimesheets.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTimesheets = this.myTimesheets.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /* ================= FILTERS ================= */

  onMonthChange(event: any) {
    this.selectedMonth = Number(event.detail.value);
    this.loadMyTimesheets();
  }

  onYearChange(event: any) {
    this.selectedYear = Number(event.detail.value);
    this.loadMyTimesheets();
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

  getStatusColor(status: string): string {
    if (!status) return 'warning'; // pending/no status

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'verified':
      case 'approved':
        return 'accept';
      case 'rejected':
        return 'reject';
      case 'submitted':
      case 'pending':
        return 'pending';
      default:
        return 'medium';
    }
  }

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