import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { LeaverequestService } from '../services/leaverequest.service';
import { WorkFromHomeService } from '../services/work-from-home.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class LeaveRequestsComponent implements OnInit, OnDestroy {

  leaveRequests: any[] = [];
  pendingWFHRequests: any[] = [];

  actionForm!: FormGroup;
  selectedRequest: any = null;

  loadingWFH = false;

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private leaveState: LeaverequestService,
    private leaveService: LeaverequestService,
    private wfhService: WorkFromHomeService
  ) { }

  ngOnInit() {
    this.actionForm = this.fb.group({
      status: ['', Validators.required],
      manager_comment: ['']
    });

    this.reloadFromApi();
    this.loadPendingWFHRequests();
  }

  reloadFromApi() {
    this.leaveService.getMyLeaves(new Date().getFullYear()).subscribe(res => {
      this.leaveRequests = res;
      console.log('Leaves:', res);
    });
  }

  loadPendingWFHRequests() {
    this.loadingWFH = true;

    this.wfhService.getPendingWFHRequests().subscribe({
      next: (res) => {
        this.pendingWFHRequests = res;
        console.log('Pending WFH:', res);
        this.loadingWFH = false;
      },
      error: (err) => {
        console.error('WFH API error', err);
        this.loadingWFH = false;
      }
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
    }

    if (status === 'REJECTED') {
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

    this.leaveService.setLeaveRequests(updated);

    this.selectedRequest = null;
    this.actionForm.reset();
  }
}
