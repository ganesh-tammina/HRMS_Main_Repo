import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LeavePlanService } from 'src/app/services/leave-plans.service';
import { LeaveTypeService } from 'src/app/services/leavetype.service';

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
  listLoading = false;
    showCreateForm = false;

  leavePlans: any[] = [];

  leaveTypes: any[] = [];
  filteredLeaveTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private leavePlanService: LeavePlanService,
    private leaveTypeService: LeaveTypeService
  ) {}

  ngOnInit(): void {
    this.leavePlanForm = this.fb.group({
      name: ['', Validators.required],
      leave_year_start_month: [1, Validators.required],
      leave_year_start_day: [1, Validators.required],
      description: [''],
      allocations: this.fb.array([]),
    });

    this.addAllocation();       // default row
    this.loadLeavePlans();      // existing plans
    this.loadLeaveTypes();      // 🔥 same logic as allocation component
  }
      openCreateForm(): void {
    this.showCreateForm = true;
  }
    cancelCreate(): void {
    this.showCreateForm = false;
    this.leavePlanForm.reset({ status: 'Active' });
  }

  /* ================= FORM ARRAY ================= */

  get allocations(): FormArray {
    return this.leavePlanForm.get('allocations') as FormArray;
  }

  addAllocation(): void {
    this.allocations.push(
      this.fb.group({
        leave_type_id: [null, Validators.required],
        days_allocated: ['', [Validators.required, Validators.min(1)]],
        prorate_on_joining: [false],
      })
    );
  }

  removeAllocation(index: number): void {
    this.allocations.removeAt(index);
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.leavePlanForm.invalid) {
      this.leavePlanForm.markAllAsTouched();
      return;
    }

    const payload = this.leavePlanForm.value;
    console.log('Payload:', payload);

    this.loading = true;

    this.leavePlanService.createLeavePlan(payload).subscribe({
      next: () => {
        this.loading = false;
        this.leavePlanForm.reset();
        this.allocations.clear();
        this.addAllocation();
        this.loadLeavePlans();
        this.showCreateForm = false;
      },
      error: (err) => {
        console.error('Create error:', err);
        this.loading = false;
      },
    });
  }

  /* ================= LOADERS ================= */

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

  loadLeaveTypes(): void {
    this.listLoading = true;
    this.leaveTypeService.getLeaveTypes().subscribe({
      next: (res: any[]) => {
        this.leaveTypes = res;
        this.filteredLeaveTypes = res.map(t => ({
          id: t.id,
          type_name: t.type_name,
        }));
        this.listLoading = false;
      },
      error: () => (this.listLoading = false),
    });
  }
}
