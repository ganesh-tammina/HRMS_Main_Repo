import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonicModule,
  ToastController,
  IonPopover,
} from '@ionic/angular';

import { CandidateService } from '../../../services/pre-onboarding.service';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { EmployeeLeavesService } from 'src/app/services/employee-leaves.service';
import { LeaverequestService } from '../../../services/leaverequest.service';

import { HeaderComponent } from '../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../employee-header/employee-header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    EmployeeHeaderComponent,
    ReactiveFormsModule,
    LeaveRequestComponent
  ]
})
export class LeavesComponent implements OnInit {
  currentYear = new Date().getFullYear();

  /** UI STATE */
  IsOpenleavePopup = false;
  isPopupOpen = false;

  selectedLeave: any = null;
  selectedDateFrom = '';
  selectedDateTo = '';
  leaveCodeIdMap: any = {};

  /** DATA */
  leaveCards: any[] = [];
  leaveRequests: any[] = [];
  leaveRequestsDeatils: any[] = [];
  approvedLeaves: any[] = []; // Approved leaves
  rejectedLeaves: any[] = []; // Rejected leaves
  leaveTypes: { code: string; name: string; available: number }[] = [];

  /** FORM */
  leaveForm!: FormGroup;
  total_days = 0;

  /** TEXTAREA */
  wordsCount = 0;
  description = '';
  currentMonthFirstDateText = '';

  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private routeGuard: RouteGuardService,
    private employeeLeaves: EmployeeLeavesService,
    private leaveRequestService: LeaverequestService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  /* ===================== INIT ===================== */
  ngOnInit() {
    this.buildForm();
    this.loadLeaveBalance();
    this.loadLeaveRequests();
    this.watchDateChanges();
    this.getallLeaves();
    this.setCurrentMonthFirstDate(); // ✅ ADD THIS

  }
  getallLeaves() {
    this.leaveRequestService.getMyLeaves(this.currentYear).subscribe({
      next: (res: any[]) => {
        this.leaveRequestsDeatils = res.map(item => ({
          id: item.id,
          leave_type: item.type_name,
          from_date: item.start_date,
          to_date: item.end_date,
          days: Number(item.total_days),
          status: item.status.toUpperCase(),
          applied_on: item.applied_at,
          reason: item.reason,
        }));

        console.log('Mapped Leave Details:', this.leaveRequestsDeatils);
      },
      error: err => console.error('Error fetching leave details:', err),
    });
  }

  /* ===================== FORM ===================== */
  buildForm() {
    this.leaveForm = this.fb.group({
      leave_type: ['', Validators.required], // CL, SL, etc
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      remarks: ['', Validators.required],
      notify: [''],
    });
  }

  watchDateChanges() {
    this.leaveForm.valueChanges.subscribe(val => {
      if (val.start_date && val.end_date) {
        const start = new Date(val.start_date);
        const end = new Date(val.end_date);

        if (end >= start) {
          const diff =
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24);
          this.total_days = diff + 1;
        } else {
          this.total_days = 0;
        }
      }
    });
  }

  /* ===================== LEAVE BALANCE ===================== */
  loadLeaveBalance() {
    this.employeeLeaves.getLeaveBalance(this.currentYear).subscribe({
      next: (res: any[]) => {
        this.leaveCodeIdMap = {};
        res.forEach(item => {
          this.leaveCodeIdMap[item.type_code] = item.leave_type_id || item.id;
        });
        this.leaveCards = res.map(item => ({
          title: item.type_name,
          allocated_days: Number(item.allocated_days),
          used: Number(item.used_days),
          available: Number(item.available_days),
          icon: this.getLeaveIcon(item.type_code),
        }));

        this.leaveTypes = res.map(item => ({
          code: item.type_code,
          name: item.type_name,
          available: Number(item.available_days),
        }));
      },
      error: err => console.error(err),
    });
  }

  getLeaveIcon(code: string): string {
    const map: any = {
      CL: 'CL.svg',
      SL: 'SL.svg',
      ML: 'ML.svg',
      CO: 'CO.svg',
      PL: 'CL.svg',
      UL: 'UL.svg',
    };
    return `../../../assets/leave-icons/${map[code] || 'CL.svg'}`;
  }

  /* ===================== LEAVE REQUESTS ===================== */
  loadLeaveRequests() {
    if (!this.routeGuard.employeeID) return;
    // keep your existing API if already working
    this.candidateService.currentEmployee$.subscribe(() => { });
  }

  /* ===================== SUBMIT (MATCHES CURL) ===================== */
  submitRequest() {
    if (this.leaveForm.invalid || this.total_days <= 0) {
      this.leaveForm.markAllAsTouched();
      this.presentToast('Please fill all required fields', 'warning');
      return;
    }

    const payload = {
      leave_type_id: this.mapLeaveCodeToId(
        this.leaveForm.value.leave_type
      ),
      start_date: this.leaveForm.value.start_date,
      end_date: this.leaveForm.value.end_date,
      total_days: this.total_days,
      reason: this.leaveForm.value.remarks,
    };

    console.log('Submitting payload (CURL MATCH):', payload);

    this.leaveRequestService.applyLeave(payload).subscribe({
      next: () => {
        this.presentToast(
          'Leave request submitted successfully!',
          'success'
        );
        this.closeleavePopup();
        this.leaveForm.reset();
        this.total_days = 0;
        this.loadLeaveBalance();
        this.getallLeaves(); // Refresh pending leave requests immediately
      },
      error: (err: any) => {
        const msg =
          err?.error?.error || 'Failed to submit leave request';
        this.presentToast(msg, 'danger');
      },
    });
  }

  /* ===================== LEAVE TYPE → ID ===================== */
  private mapLeaveCodeToId(code: string): number {
    const id = this.leaveCodeIdMap[code];

    if (!id) {
      console.error('Leave type ID not found for code:', code);
    }

    return id;
  }

  /* ===================== MODALS ===================== */
  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
    this.leaveForm.reset();
    this.total_days = 0;
  }

  openPopup(leave: any) {
    this.selectedLeave = leave;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedLeave = null;
  }

  /* ===================== DATE PICKERS ===================== */
  onDateChangeFrom(ev: any, popover: IonPopover) {
    this.selectedDateFrom = ev.detail.value;
    this.leaveForm.patchValue({ start_date: ev.detail.value });
    popover.dismiss();
  }

  onDateChangeTo(ev: any, popover: IonPopover) {
    this.selectedDateTo = ev.detail.value;
    this.leaveForm.patchValue({ end_date: ev.detail.value });
    popover.dismiss();
  }

  /* ===================== WORD LIMIT ===================== */
  validateWordLimit(ev: any) {
    let words = (ev.target.value || '').trim().split(/\s+/);
    this.wordsCount = words.length;

    if (words.length > 100) {
      words = words.slice(0, 100);
      this.leaveForm.patchValue({
        remarks: words.join(' '),
      });
    }
  }

  /* ===================== TOAST ===================== */
  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    toast.present();
  }
  openApproveReject() {
    this.router.navigate(['/approve-reject-leave']);
  }
  setCurrentMonthFirstDate() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.currentMonthFirstDateText = firstDayOfMonth.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
