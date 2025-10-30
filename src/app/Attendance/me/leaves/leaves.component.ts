import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../employee-header/employee-header.component';
import { CandidateService } from '../../../services/pre-onboarding.service';
import { LeaveService } from '../../../services/leave.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  IsOpenleavePopup = false;
  leaveData: any = null; // leave balances
  leaveRequests: any[] = []; // all leave requests
  leaveForm!: FormGroup;
  total_days: number = 0;

  constructor(
    private candidateService: CandidateService,
    private leaveService: LeaveService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Initialize leave form
    this.leaveForm = this.fb.group({
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      remarks: ['', Validators.required],
      notify: ['']
    });

    // Calculate total days dynamically
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

    // Subscribe to current employee
    this.candidateService.currentEmployee$.subscribe(emp => {
      if (emp) {
        this.currentCandidate = emp;
        this.loadLeaves();
      } else {
        const stored = localStorage.getItem('employee_details');
        if (stored) {
          let parsed = JSON.parse(stored);
          while (Array.isArray(parsed)) parsed = parsed[0];
          this.currentCandidate = parsed;
          this.loadLeaves();
        }
      }

      console.log('Current Employee:', this.currentCandidate);
    });
  }

  // Load leave balances and leave requests
  loadLeaves() {
    if (this.currentCandidate?.employee_id) {
      this.leaveService.getLeaves(this.currentCandidate.employee_id).subscribe({
        next: (data: any) => {
          if (Array.isArray(data)) {
            this.leaveData = data[0]; // leave balances
            this.leaveRequests = data; // all leave requests
          } else {
            this.leaveData = data;
            this.leaveRequests = [data];
          }
          // Optional: sort by submitted_on descending
          this.leaveRequests.sort((a, b) => new Date(b.submitted_on).getTime() - new Date(a.submitted_on).getTime());
          console.log('Leave Data:', this.leaveData);
          console.log('Leave Requests:', this.leaveRequests);
        },
        error: (err) => console.error('Error fetching leave data:', err)
      });
    }
  }

  // Submit leave request
  submitRequest() {
    if (this.leaveForm.invalid || this.total_days <= 0) {
      this.leaveForm.markAllAsTouched();
      console.warn('Form is invalid. Please complete all required fields.');
      return;
    }

    const formData = this.leaveForm.value;
    const leaveRequest = {
      employee_id: this.currentCandidate?.employee_id,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      remarks: formData.remarks,
      notify: formData.notify,
      total_days: this.total_days
    };

    console.log('Submitting leave request:', leaveRequest);

    this.leaveService.requestLeave(leaveRequest).subscribe({
      next: (res) => {
        console.log('Leave requested successfully:', res);
        this.closeleavePopup();
        this.loadLeaves();
        this.leaveForm.reset();
        this.total_days = 0;
      },
      error: (err) => {
        console.error('Error submitting leave request:', err);
      }
    });
  }

  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
  }
}
