import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { LeaverequestService } from '../services/leaverequest.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class LeaveRequestsComponent implements OnInit, OnDestroy {

  leaveRequests: any[] = [];
  actionForm!: FormGroup;
  selectedRequest: any = null;

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private leaveState: LeaverequestService,
    private leaveService: LeaverequestService
  ) { }

  ngOnInit() {
    this.actionForm = this.fb.group({
      status: ['', Validators.required],
      manager_comment: ['']
    });
    this.reloadFromApi();
  }

  reloadFromApi() {
    this.leaveService.getMyLeaves(new Date().getFullYear()).subscribe(res => {
      this.leaveRequests = res;
      console.log(res);

    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  openActionForm(req: any) {
    this.selectedRequest = req;
    this.actionForm.reset();
  }

  closeForm() {
    this.selectedRequest = null;
  }


  submitDecision() {
    if (this.actionForm.invalid || !this.selectedRequest) {
      this.actionForm.markAllAsTouched();
      return;
    }

    const status = this.actionForm.value.status;
    const comment = this.actionForm.value.manager_comment || '';
    const leaveId = this.selectedRequest.id;

    if (status === 'APPROVED') {

      this.leaveService.approveLeave(leaveId, comment).subscribe({
        next: () => {
          alert('✅ Your leave request is approved');

          this.updateStateLocally('APPROVED');
        },
        error: () => alert('Failed to approve leave')
      });

    } else if (status === 'REJECTED') {

      this.leaveService.rejectLeave(leaveId, comment).subscribe({
        next: () => {
          alert('❌ Your leave request is rejected');

          this.updateStateLocally('REJECTED');
        },
        error: () => alert('Failed to reject leave')
      });

    }
  }
  private updateStateLocally(newStatus: 'APPROVED' | 'REJECTED') {

    const updated = this.leaveRequests.map(req =>
      req.id === this.selectedRequest.id
        ? { ...req, status: newStatus }
        : req
    );

    // 🔥 update shared state
    this.leaveService.setLeaveRequests(updated);

    // cleanup
    this.selectedRequest = null;
    this.actionForm.reset();
  }
}
