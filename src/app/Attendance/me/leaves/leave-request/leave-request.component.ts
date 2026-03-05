import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IonicModule, ToastController, IonPopover } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HeaderComponent } from '../../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../../employee-header/employee-header.component';
import { EmployeeLeavesService } from 'src/app/services/employee-leaves.service';
import { LeaverequestService } from 'src/app/services/leaverequest.service';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    EmployeeHeaderComponent
  ]
})
export class LeaveRequestComponent implements OnInit {
  @Output() leaveSubmitted = new EventEmitter<void>(); // Notify parent

  currentYear = new Date().getFullYear();

  leaveTypes: any[] = [];
  leaveForm!: FormGroup;

  total_days = 0;
  wordsCount = 0;

  selectedDateFrom = '';
  selectedDateTo = '';
  minDate = new Date().toISOString().split('T')[0];

  /** Store all leaves for date check (pending, approved, rejected) */
  existingLeaves: { from_date: string; to_date: string; status: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeLeaves: EmployeeLeavesService,
    private leaveRequestService: LeaverequestService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.buildForm();
    this.loadLeaveBalance();
    this.handleDateChanges();
    this.loadPendingLeaves();
  }
  /** Load all leaves (pending, approved, rejected) for this employee */
  loadPendingLeaves() {
    this.leaveRequestService.getMyLeaves(this.currentYear).subscribe({
      next: (leaves: any[]) => {
        // Always use start_date and end_date from backend, fallback to from_date/to_date if needed
        this.existingLeaves = leaves
          .filter(l => l.status === 'PENDING' || l.status === 'APPROVED' || l.status === 'REJECTED')
          .map(l => ({
            from_date: l.start_date || l.from_date,
            to_date: l.end_date || l.to_date || l.start_date || l.from_date, // fallback for single day
            status: l.status
          }));
      },
      error: () => {
        this.existingLeaves = [];
      }
    });
  }

  /* ================= FORM ================= */

  buildForm() {
    this.leaveForm = this.fb.group({
      leave_type: ['', Validators.required], // leave_type_id
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      remarks: ['', Validators.required],
      notify: ['']
    });
  }

  handleDateChanges() {
    this.leaveForm.valueChanges.subscribe(val => {
      const from = val.start_date ? new Date(val.start_date) : null;
      const to = val.end_date ? new Date(val.end_date) : null;

      if (from && to && to >= from) {
        const diff =
          (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        this.total_days = Math.floor(diff) + 1;
      } else {
        this.total_days = 0;
      }
    });
  }

  /* ================= API ================= */

  loadLeaveBalance() {
    this.employeeLeaves.getLeaveBalance(this.currentYear).subscribe({
      next: (res: any[]) => {
        this.leaveTypes = res.map(item => ({
          id: item.leave_type_id,        // ✅ REAL BACKEND ID
          name: item.type_name,
          code: item.type_code,
          available: Number(item.available_days) || 0
        }));
      }
    });
  }

  /* ================= SUBMIT ================= */

  submitRequest() {
    if (this.leaveForm.invalid || this.total_days <= 0) {
      this.presentToast('Please fill all required fields', 'warning');
      return;
    }

    const form = this.leaveForm.value;
    const selectedLeave = this.leaveTypes.find(l => l.id === form.leave_type);
    if (!selectedLeave) {
      this.presentToast('Invalid leave type', 'danger');
      return;
    }
    if (this.total_days > selectedLeave.available) {
      this.presentToast(`Only ${selectedLeave.available} days available`, 'warning');
      return;
    }


    // Check if any date in the new request is already taken (pending, approved, or rejected)
    const normalize = (date: any) => {
      if (!date) return '';
      if (typeof date === 'string' && date.length === 10) return date; // already YYYY-MM-DD
      const d = new Date(date);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const newFrom = new Date(form.start_date);
    const newTo = new Date(form.end_date);
    let dateConflict = false;
    for (let d = new Date(newFrom); d <= newTo; d.setDate(d.getDate() + 1)) {
      const dStr = normalize(d);
      for (const l of this.existingLeaves) {
        const lFrom = new Date(l.from_date);
        const lTo = new Date(l.to_date);
        for (let ld = new Date(lFrom); ld <= lTo; ld.setDate(ld.getDate() + 1)) {
          const ldStr = normalize(ld);
          // Debug log for troubleshooting
          // console.log('Comparing', dStr, 'with', ldStr, 'status:', l.status);
          if (dStr === ldStr) {
            dateConflict = true;
            break;
          }
        }
        if (dateConflict) break;
      }
      if (dateConflict) break;
    }
    if (dateConflict) {
      this.presentToast('A leave request already exists for at least one of these dates. Duplicate leave requests are not allowed.', 'danger');
      return;
    }

    const payload = {
      leave_type_id: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      total_days: this.total_days,
      reason: form.remarks
    };

    this.leaveRequestService.applyLeave(payload).subscribe({
      next: () => {
        this.leaveForm.reset();
        this.total_days = 0;
        this.selectedDateFrom = '';
        this.selectedDateTo = '';
        this.presentToast('Leave request submitted successfully', 'success');
        this.leaveSubmitted.emit(); // Emit event to parent
        this.loadPendingLeaves(); // Refresh pending leaves
      },
      error: (err) => {
        this.presentToast(
          err?.error?.error || 'Failed to submit leave',
          'danger'
        );
        this.loadPendingLeaves(); // Always refresh leaves after error too
      }
    });
  }

  /* ================= HELPERS ================= */

  validateWordLimit(ev: any) {
    const value = ev.target.value || '';
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    this.wordsCount = words.length;

    if (words.length > 100) {
      this.leaveForm.patchValue({
        remarks: words.slice(0, 100).join(' ')
      });
      this.wordsCount = 100;
    }
  }

  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  onDateChangeFrom(event: any, popover: IonPopover) {
    this.leaveForm.patchValue({ start_date: event.detail.value });
    this.selectedDateFrom = event.detail.value;
    popover.dismiss();
  }

  onDateChangeTo(event: any, popover: IonPopover) {
    this.leaveForm.patchValue({ end_date: event.detail.value });
    this.selectedDateTo = event.detail.value;
    popover.dismiss();
  }
}
