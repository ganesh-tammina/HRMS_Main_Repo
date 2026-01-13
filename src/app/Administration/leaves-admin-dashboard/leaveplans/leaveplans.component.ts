import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LeavePlanService, LeavePlan } from 'src/app/services/leave-plans.service';

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
  loadingPlanDetails = false;
  showCreateForm = false;

  leavePlans: LeavePlan[] = [];

  // EDIT STATE
  isEditMode = false;
  editingPlanId: number | null = null;

  // VIEW STATE
  selectedPlan: LeavePlan | null = null;

  constructor(
    private fb: FormBuilder,
    private leavePlanService: LeavePlanService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.leavePlanForm = this.fb.group({
      name: ['', Validators.required],
      leave_year_start_month: [1, Validators.required],
      leave_year_start_day: [1, Validators.required],
      description: [''],
      is_active: [true],
    });

    this.loadLeavePlans();
  }

  ionViewWillEnter(): void {
    this.loadLeavePlans();
  }

  /* ================= CREATE ================= */

  openCreateForm(): void {
    this.isEditMode = false;
    this.editingPlanId = null;

    this.leavePlanForm.reset({
      leave_year_start_month: 1,
      leave_year_start_day: 1,
      is_active: true,
    });

    this.showCreateForm = true;
  }

  /* ================= EDIT ================= */

  editPlan(plan: any): void {
    this.isEditMode = true;
    this.editingPlanId = plan.id;
    this.loading = true;

    // Fetch full plan details including allocations
    this.leavePlanService.getLeavePlanById(plan.id).subscribe({
      next: (fullPlan) => {
        this.leavePlanForm.patchValue({
          name: fullPlan.name,
          leave_year_start_month: fullPlan.leave_year_start_month,
          leave_year_start_day: fullPlan.leave_year_start_day,
          description: fullPlan.description,
          is_active: fullPlan.is_active !== undefined ? fullPlan.is_active : true,
        });

        this.loading = false;
        this.showCreateForm = true;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load plan details for editing');
      }
    });
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.isEditMode = false;
    this.editingPlanId = null;
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.leavePlanForm.invalid) {
      this.leavePlanForm.markAllAsTouched();
      return;
    }

    const payload = this.leavePlanForm.value;
    this.loading = true;

    const request$ = this.isEditMode
      ? this.leavePlanService.updateLeavePlan(this.editingPlanId!, payload)
      : this.leavePlanService.createLeavePlan(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.showCreateForm = false; // Close the modal on success
        this.loadLeavePlans(); // Refresh the leave plans immediately
      },
      error: () => {
        this.loading = false;
        alert('Failed to submit leave plan');
      },
    });
  }

  /* ================= VIEW SINGLE PLAN ================= */

  viewPlanDetails(planId: number): void {
    this.loadingPlanDetails = true;

    this.leavePlanService.getLeavePlanById(planId).subscribe({
      next: (res) => {
        this.selectedPlan = res;
        this.loadingPlanDetails = false;
      },
      error: () => (this.loadingPlanDetails = false),
    });
  }

  /* ================= DELETE ================= */

  deletePlan(planId: number): void {
    if (!confirm('Are you sure you want to delete this leave plan?')) return;

    this.leavePlanService.deleteLeavePlan(planId).subscribe({
      next: () => this.loadLeavePlans(),
    });
  }

  /* ================= LOAD ================= */

  loadLeavePlans(): void {
    this.loadingPlans = true;
    this.leavePlanService.getLeavePlans().subscribe({
      next: (res) => {
        this.leavePlans = res || [];
        this.loadingPlans = false;
      },
      error: () => (this.loadingPlans = false),
    });
  }

  leavetype() {
    this.router.navigate(['./admin-leaves']);
  }
  adminManagement() {
    this.router.navigate(['./admin']);
  }
}
