import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../employee-header/employee-header.component';
import { CandidateService } from '../../../services/pre-onboarding.service';
import { LeaveService } from '../../../services/leave.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouteGuardService } from 'src/app/services/route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    HeaderComponent,
    EmployeeHeaderComponent,
    ReactiveFormsModule
  ]
})
export class LeavesComponent implements OnInit {

  currentCandidate: any;
  IsOpenleavePopup = false; // for "Apply Leave" form modal
  isPopupOpen = false;      // for "Cancel/View" popup
  selectedLeave: any = null;

  leaveData: any = {
    casual_leave_taken: 0,
    casual_leave_allocated: 0,
    marriage_leave_taken: 0,
    marriage_leave_allocated: 0,
    medical_leave_taken: 0,
    medical_leave_allocated: 0,
    comp_offs_taken: 0,
    comp_offs_allocated: 0,
    paid_leave_taken: 0,
    paid_leave_allocated: 0
  };

  leaveRequests: any[] = [];
  leaveForm!: FormGroup;
  total_days: number = 0;

  constructor(
    private candidateService: CandidateService,
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private routerGaurd: RouteGuardService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadLeaveRequests();
    this.loadLeaveBalance();

    this.leaveForm = this.fb.group({
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', [Validators.required, this.dateValidator.bind(this)]],
      remarks: ['', Validators.required],
      notify: ['']
    });

    this.leaveForm.valueChanges.subscribe(val => {
      const from = val.start_date ? new Date(val.start_date) : null;
      const to = val.end_date ? new Date(val.end_date) : null;

      if (from && to && to >= from) {
        const diff = Math.abs(to.getTime() - from.getTime());
        this.total_days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      } else {
        this.total_days = 0;
      }
    });

    this.candidateService.currentEmployee$.subscribe(emp => {
      if (emp) {
        this.currentCandidate = emp;
        this.loadLeaveRequests();
        this.loadLeaveBalance();
      }
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'
    });
    toast.present();
  }

  dateValidator(control: any) {
    const start = this.leaveForm?.get('start_date')?.value;
    const end = control.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate < startDate) {
        return { dateError: 'End date cannot be before start date.' };
      }
    }
    return null;
  }

  loadLeaveRequests() {
    if (this.routerGaurd.employeeID) {
      this.leaveService.getLeaveRequests(parseInt(this.routerGaurd.employeeID)).subscribe({
        next: (data: any) => {
          this.leaveRequests = data;
          console.log('Leave Requests:', this.leaveRequests);
        },
        error: (err) => console.error('Error fetching leave data:', err)
      });
    }
  }

  loadLeaveBalance() {
    if (this.routerGaurd.employeeID) {
      this.leaveService.getLeaveBalance(parseInt(this.routerGaurd.employeeID)).subscribe({
        next: (data: any) => {  
          this.leaveData = data.leaveBalance || this.leaveData;
          console.log('Leave Balance:', this.leaveData);
        },
        error: (err) => console.error('Error fetching leave balance:', err)
      });
    }
  }

  submitRequest() {
    if (this.leaveForm.invalid || this.total_days <= 0) {
      this.leaveForm.markAllAsTouched();
      this.presentToast('Please fill all required fields and ensure dates are valid.', 'warning');
      return;
    }

    const formData = this.leaveForm.value;
    const leaveRequest = {
      employee_id: this.routerGaurd.employeeID,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      remarks: formData.remarks,
      notify: formData.notify,
      total_days: this.total_days
    };

    this.leaveService.requestLeave(leaveRequest).subscribe({
      next: () => {
        this.closeleavePopup();
        this.loadLeaveRequests();
        this.loadLeaveBalance();
        this.leaveForm.reset();
        this.total_days = 0;
        this.presentToast('Leave request submitted successfully!', 'success');
      },
      error: (err) => { 
        console.error('Error submitting leave request:', err);
        const errorMsg = err?.error?.error || 'Failed to submit leave request.';
        this.presentToast(errorMsg, 'danger');
      }
    });
  }

  cancelLeave(leaveId: number) {
    this.leaveService.cancelLeaveRequest(leaveId).subscribe({
      next: () => {
        this.loadLeaveRequests();
        this.loadLeaveBalance();
        this.presentToast('Leave request cancelled successfully!', 'success');  
      },  
      error: (err) => {
        console.error('Error cancelling leave request:', err);
        const errorMsg = err?.error?.error || 'Failed to cancel leave request.';
        this.presentToast(errorMsg, 'danger');
      }
    });
  }

  // -----------------------------
  // Modal Controls
  // -----------------------------

  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
  }

  // -----------------------------
  // Popup Controls (Cancel/View)
  // -----------------------------

  openPopup(leave: any) {
    this.selectedLeave = leave;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedLeave = null;
  }

  confirmCancel() {
    if (this.selectedLeave?.id) {
      this.cancelLeave(this.selectedLeave.id);
    }
    this.closePopup();
  }
}
