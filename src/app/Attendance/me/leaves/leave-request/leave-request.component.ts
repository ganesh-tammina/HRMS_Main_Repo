import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, IonPopover } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HeaderComponent } from '../../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../../employee-header/employee-header.component';
import { CandidateService } from '../../../../services/pre-onboarding.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
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
  leaveCards: any[] = [];
  leaveRequests: any[] = [];
  leaveTypes: any[] = [];

  leaveForm!: FormGroup;
  total_days = 0;
  wordsCount = 0;

  selectedDateFrom = '';
  selectedDateTo = '';
  minDate = new Date().toISOString().split('T')[0];

  IsOpenleavePopup = false;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private routerGuard: RouteGuardService,
    private employeeLeaves: EmployeeLeavesService,
    private leaveRequestService: LeaverequestService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.buildForm();
    this.loadLeaveBalance();
    this.loadMyLeaves();
    this.handleDateChanges();
  }

  /* ================= FORM ================= */

  buildForm() {
    this.leaveForm = this.fb.group({
      leave_type: ['', Validators.required],
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
          code: item.type_code,
          name: item.type_name,
          available: Number(item.available_days) || 0
        }));
      }
    });
  }

  loadMyLeaves() {
    this.leaveRequestService.getMyLeaves(this.currentYear).subscribe({
      next: res => (this.leaveRequests = res)
    });
  }

  /* ================= SUBMIT ================= */

  submitRequest() {
    if (this.leaveForm.invalid || this.total_days <= 0) {
      this.leaveForm.markAllAsTouched();
      this.presentToast('Please fill all required fields', 'warning');
      return;
    }

    const form = this.leaveForm.value;

    const payload = {
      leave_type_id: this.getLeaveTypeId(form.leave_type),
      start_date: form.start_date,
      end_date: form.end_date,
      total_days: this.total_days,
      reason: form.remarks
    };

    console.log('Submitting Leave Payload:', payload);

    this.leaveRequestService.applyLeave(payload).subscribe({
      next: () => {
        this.leaveForm.reset();
        this.total_days = 0;
        this.IsOpenleavePopup = false;
        this.loadMyLeaves();
        this.presentToast('Leave request submitted successfully', 'success');
      },
      error: () => {
        this.presentToast('Failed to submit leave request', 'danger');
      }
    });
  }

  /* ================= HELPERS ================= */

  getLeaveTypeId(code: string): number {
    const map: any = {
      CL: 1,
      SL: 2,
      ML: 3,
      PL: 4,
      CO: 5,
      UL: 6
    };
    return map[code];
  }

  validateWordLimit(ev: any) {
    const value = ev.target.value || '';
    const words = value.trim().split(/\s+/);
    this.wordsCount = words.length;

    if (words.length > 100) {
      const trimmed = words.slice(0, 100).join(' ');
      this.leaveForm.patchValue({ remarks: trimmed });
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
