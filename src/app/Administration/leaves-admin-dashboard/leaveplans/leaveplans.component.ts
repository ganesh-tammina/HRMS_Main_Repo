import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LeavePlanService } from 'src/app/services/leave-plans.service';

@Component({
  selector: 'app-create-leave-plan',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './leaveplans.component.html',
  styleUrls: ['./leaveplans.component.scss'],
})
export class LeaveplansComponent implements OnInit {

  leavePlanForm!: FormGroup;

  loading = false;
  loadingPlans = false;

  leavePlans: any[] = [];

  constructor(
    private fb: FormBuilder,
    private leavePlanService: LeavePlanService
  ) { }

  ngOnInit(): void {
    this.leavePlanForm = this.fb.group({
      name: ['', Validators.required],
      leave_year_start_month: [1, Validators.required],
      leave_year_start_day: [1, Validators.required],
      description: [''],
    });

    this.loadLeavePlans();
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.leavePlanForm.invalid) {
      this.leavePlanForm.markAllAsTouched();
      return;
    }

    const payload = this.leavePlanForm.value;
    console.log('Leave Plan Payload 👉', payload);

    this.loading = true;

    this.leavePlanService.createLeavePlan(payload).subscribe({
      next: () => {
        this.loading = false;
        this.leavePlanForm.reset({
          leave_year_start_month: 1,
          leave_year_start_day: 1,
        });
        this.loadLeavePlans();
      },
      error: (err) => {
        console.error('Create error:', err);
        this.loading = false;
      },
    });
  }

  /* ================= LOAD PLANS ================= */

  loadLeavePlans(): void {
    this.loadingPlans = true;
    this.leavePlanService.getLeavePlans().subscribe({
      next: (res) => {
        this.leavePlans = res;
        this.loadingPlans = false;
      },
      error: () => (this.loadingPlans = false),
    });
  }
}
