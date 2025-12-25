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
    private leaveState: LeaverequestService
  ) { }

  ngOnInit() {
    this.actionForm = this.fb.group({
      status: ['', Validators.required],
      manager_comment: ['']
    });

    // ✅ SUBSCRIBE TO PERMANENT STATE
    this.sub = this.leaveState.leaveRequests$.subscribe(requests => {
      console.log('STATE RECEIVED:', requests);
      this.leaveRequests = requests;
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
}
