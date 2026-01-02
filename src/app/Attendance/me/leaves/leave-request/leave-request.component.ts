import { Component, OnInit } from '@angular/core';
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

  currentYear = new Date().getFullYear();

  leaveTypes: any[] = [];
  leaveForm!: FormGroup;

  total_days = 0;
  wordsCount = 0;

  selectedDateFrom = '';
  selectedDateTo = '';
  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private employeeLeaves: EmployeeLeavesService,
    private leaveRequestService: LeaverequestService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadLeaveBalance();
    this.handleDateChanges();
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

    const selectedLeave = this.leaveTypes.find(
      l => l.id === form.leave_type
    );

    if (!selectedLeave) {
      this.presentToast('Invalid leave type', 'danger');
      return;
    }

    if (this.total_days > selectedLeave.available) {
      this.presentToast(
        `Only ${selectedLeave.available} days available`,
        'warning'
      );
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
      },
      error: (err) => {
        this.presentToast(
          err?.error?.error || 'Failed to submit leave',
          'danger'
        );
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
