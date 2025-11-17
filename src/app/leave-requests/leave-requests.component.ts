import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../services/pre-onboarding.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LeaveRequestsComponent implements OnInit {
  actions: string = 'Pending';
  leaveRequests: any[] = [];
  actionForm!: FormGroup;
  selectedRequest: any = null;
  one: any;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  fullName: any;
  currentemp: any;
  employee_id: any;

  constructor(
    private candidateService: CandidateService,
    private fb: FormBuilder,
    private routeGuardService: RouteGuardService,
  ) { }

  ngOnInit() {
    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          if (this.allEmployees.length > 0) {
            this.one = this.allEmployees[0];
            this.fullName = this.one[0].full_name;
            this.employee_id = this.one[0].employee_id;

            localStorage.setItem('employee_id', this.employee_id);
            this.candidateService.setLoggedEmployeeId(this.employee_id);

            console.log("Employee ID:", this.employee_id);

            // 🚀 LOAD REQUESTS ONLY AFTER employee_id is available
            this.loadRequests();
          }
        },
        error: (err) => {
          console.error('Error fetching all employees:', err);
        },
      });
    }

    this.actionForm = this.fb.group({
      status: ['', Validators.required],
      manager_comment: ['']
    });
  }

  loadRequests() {
    const payload = {
      employee_id: this.employee_id,
      action: this.actions
    };

    console.log("Payload Sent:", payload); // DEBUG

    this.candidateService.getLeaveRequests(payload).subscribe((data: any) => {
      this.leaveRequests = data;
      console.log("Leave Requests:", this.leaveRequests);
    });
  }

  openActionForm(request: any) {
    this.selectedRequest = request;
    this.actionForm.reset();
  }

  submitDecision() {
    if (this.actionForm.invalid) {
      this.actionForm.markAllAsTouched();
      return;
    }


    const payload = {
      action_by_emp_id: this.employee_id,
      action: this.actionForm.value.status.toUpperCase(),
      leave_req_id: this.selectedRequest.id,
    };
    this.candidateService.getLeaveAction(payload).subscribe(

      (res: any) => {
        alert("Leave request " + payload);
        this.selectedRequest = null;
        this.loadRequests();
      },
      (err: any) => alert("Error updating status")
    );
  }

  closeForm() {
    this.selectedRequest = null;
  }
}
