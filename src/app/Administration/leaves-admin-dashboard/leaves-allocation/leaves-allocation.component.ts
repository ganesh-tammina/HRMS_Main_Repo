import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';

import { UpdatealloctionleaveService } from 'src/app/services/updatealloctionleave.service';
import { LeavePlanService } from 'src/app/services/leave-plans.service';
import { LeaveTypeService } from 'src/app/services/leavetype.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaves-allocation',
  templateUrl: './leaves-allocation.component.html',
  styleUrls: ['./leaves-allocation.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class LeavesAllocationComponent implements OnInit {

  selectedPlanId: number | null = null;
  allocationForm!: FormGroup;
  loading = false;

  leavePlans: any[] = [];
  leaveTypes: any[] = [];
  filteredLeaveTypes: any[] = [];

  // ✅ ADDED (persistent display)
  savedAllocationResult: any = null;
  private STORAGE_KEY = 'LEAVE_ALLOCATION_RESULT';

  constructor(
    private fb: FormBuilder,
    private updateAllocationService: UpdatealloctionleaveService,
    private toastCtrl: ToastController,
    private leavePlanService: LeavePlanService,
    private leaveTypesService: LeaveTypeService
  ) { }

  ngOnInit(): void {
    this.allocationForm = this.fb.group({
      name: [''],
      description: [''],
      allocations: this.fb.array([]),
    });

    this.loadLeavePlans();
    this.loadLeaveTypes();

    // ✅ LOAD SAVED CARD ON ENTER
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.savedAllocationResult = JSON.parse(stored);
    }
  }

  get allocations(): FormArray {
    return this.allocationForm.get('allocations') as FormArray;
  }

  addAllocation(leaveTypeId: any = null, days: any = null, prorate = true): void {
    this.allocations.push(
      this.fb.group({
        leave_type_id: [leaveTypeId, Validators.required],
        days_allocated: [days, [Validators.required, Validators.min(1)]],
        prorate_on_joining: [prorate],
      })
    );
  }

  removeAllocation(index: number): void {
    this.allocations.removeAt(index);
  }

  /* ================= SAVE (UNCHANGED FLOW) ================= */

  submitallocationLeaves(): void {
    if (!this.selectedPlanId || this.allocationForm.invalid) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.loading = true;

    this.updateAllocationService
      .updateLeaveAllocation(this.selectedPlanId, this.allocationForm.value)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showToast('Leave allocation updated successfully', 'success');

          // ✅ PREPARE + SAVE DISPLAY DATA
          this.persistSavedResult(res);
        },
        error: () => {
          this.loading = false;
          this.showToast('Failed to update leave allocation', 'danger');
        },
      });
  }

  /* ================= PERSIST DISPLAY ================= */

  persistSavedResult(res: any): void {
    const plan = this.leavePlans.find(p => p.id === this.selectedPlanId);

    this.savedAllocationResult = {
      plan_id: this.selectedPlanId,
      plan_name: res?.plan_name || plan?.name,
      allocations: this.allocationForm.value.allocations.map((alloc: any) => {
        const leaveType = this.leaveTypes.find(t => t.id === alloc.leave_type_id);
        return {
          leave_type_name: leaveType?.type_name || 'Leave Type',
          days_allocated: alloc.days_allocated,
        };
      }),
    };

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.savedAllocationResult)
    );
  }

  /* ================= DELETE ================= */

  deleteSavedAllocation(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.savedAllocationResult = null;
    this.showToast('Allocation deleted permanently', 'success');
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  /* ================= LOADERS ================= */

  loadLeavePlans(): void {
    this.leavePlanService.getLeavePlans().subscribe(res => {
      this.leavePlans = res;
    });
  }

  loadLeaveTypes(): void {
    this.leaveTypesService.getLeaveTypes().subscribe(res => {
      this.leaveTypes = res;
      this.filteredLeaveTypes = res.map(t => ({
        id: t.id,
        type_name: t.type_name,
      }));
    });
  }

  onPlanChange(planId: number): void {
    const plan = this.leavePlans.find(p => p.id === planId);
    if (!plan) return;

    this.selectedPlanId = planId;

    this.allocationForm.patchValue({
      name: plan.name,
      description: plan.description,
    });

    this.allocations.clear();
    plan.allocations?.forEach((alloc: any) => {
      this.addAllocation(
        alloc.leave_type_id,
        alloc.days_allocated,
        alloc.prorate_on_joining === 1 || alloc.prorate_on_joining === true
      );
    });
  }
}
