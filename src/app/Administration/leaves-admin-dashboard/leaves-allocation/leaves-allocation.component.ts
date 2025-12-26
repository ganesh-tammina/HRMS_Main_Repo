import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UpdatealloctionleaveService } from 'src/app/services/updatealloctionleave.service';
import { LeavePlanService } from 'src/app/services/leave-plans.service';
import { LeaveTypeService } from 'src/app/services/leavetype.service';

@Component({
  selector: 'app-leaves-allocation',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './leaves-allocation.component.html',
  styleUrls: ['./leaves-allocation.component.scss'],
})
export class LeavesAllocationComponent implements OnInit {

  planId = 2;
  selectedPlanId!: number | null;

  allocationForm!: FormGroup;
  loading = false;

  leavePlans: any[] = [];
  leaveTypes: any[] = [];
  filteredLeaveTypes: any[] = [];

  loadingPlans = false;
  listLoading = false;

  constructor(
    private fb: FormBuilder,
    private updateAllocationService: UpdatealloctionleaveService,
    private toastCtrl: ToastController,
    private leavePlanService: LeavePlanService,
    private leaveTypesService: LeaveTypeService
  ) { }

  ngOnInit(): void {
    this.allocationForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      allocations: this.fb.array([]),
    });

    this.loadLeavePlans();
    this.loadLeaveTypes();
  }

  /* ================= FORM ARRAY ================= */

  get allocations(): FormArray {
    return this.allocationForm.get('allocations') as FormArray;
  }

  addAllocation(
    leaveTypeId: number | null = null,
    days: number | null = null,
    prorate = true
  ): void {
    this.allocations.push(
      this.fb.group({
        leave_type_id: [leaveTypeId, Validators.required],
        days_allocated: [days, Validators.required],
        prorate_on_joining: [prorate],
      })
    );
  }

  removeAllocation(index: number): void {
    this.allocations.removeAt(index);
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.allocationForm.invalid) {
      this.allocationForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.updateAllocationService
      .updateLeaveAllocation(this.planId, this.allocationForm.value)
      .subscribe({
        next: async () => {
          this.loading = false;
          const toast = await this.toastCtrl.create({
            message: 'Leave allocation updated successfully',
            duration: 2000,
            color: 'success',
          });
          toast.present();
        },
        error: async () => {
          this.loading = false;
          const toast = await this.toastCtrl.create({
            message: 'Failed to update leave allocation',
            duration: 2000,
            color: 'danger',
          });
          toast.present();
        },
      });
  }

  /* ================= LEAVE PLANS ================= */

  loadLeavePlans(): void {
    this.loadingPlans = true;

    this.leavePlanService.getLeavePlans().subscribe({
      next: (res: any[]) => {
        this.leavePlans = res;
        this.loadingPlans = false;
      },
      error: () => (this.loadingPlans = false),
    });
  }

  onPlanChange(planId: number): void {
    const selectedPlan = this.leavePlans.find(p => p.id === planId);
    if (!selectedPlan) return;

    this.planId = planId;
    this.selectedPlanId = planId;

    this.allocationForm.patchValue({
      name: selectedPlan.name,
      description: selectedPlan.description,
    });

    this.allocations.clear();

    if (selectedPlan.allocations?.length) {
      selectedPlan.allocations.forEach((alloc: any) => {
        this.addAllocation(
          alloc.leave_type_id,
          alloc.days_allocated,
          alloc.prorate_on_joining
        );
      });
    }
  }

  /* ================= LEAVE TYPES ================= */

  loadLeaveTypes(): void {
    this.listLoading = true;

    this.leaveTypesService.getLeaveTypes().subscribe({
      next: (res: any[]) => {
        this.leaveTypes = res;

        // ✅ Filter only required fields (id + type_name)
        this.filteredLeaveTypes = this.leaveTypes
          .filter(t => t.type_name) // safety check
          .map(t => ({
            id: t.id,
            type_name: t.type_name
          }));

        this.listLoading = false;
      },
      error: () => (this.listLoading = false),
    });
  }
}
