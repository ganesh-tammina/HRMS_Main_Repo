import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LeavePlanService } from 'src/app/services/leave-plans.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-leave-plan',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './leaveplans.component.html',
  styleUrls: ['./leaveplans.component.scss']
})
export class LeaveplansComponent implements OnInit {

  leavePlanForm!: FormGroup;
  loading = false;
  leavePlans: any[] = [];
  loadingPlans = false;
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
      allocations: this.fb.array([]),
    });

    this.addAllocation(); // default one row
    this.loadLeavePlans();
  }

  /** allocations form array */
  get allocations(): FormArray {
    return this.leavePlanForm.get('allocations') as FormArray;
  }

  /** add allocation */
  addAllocation(): void {
    this.allocations.push(
      this.fb.group({
        leave_type_id: ['', Validators.required],
        days_allocated: ['', Validators.required],
        prorate_on_joining: [false],
      })
    );
  }

  /** remove allocation */
  removeAllocation(index: number): void {
    this.allocations.removeAt(index);
  }

  /** submit */
  submit(): void {
    if (this.leavePlanForm.invalid) {
      this.leavePlanForm.markAllAsTouched();
      return;
    }

    const payload = this.leavePlanForm.value;

    console.log('Payload:', payload);

    this.loading = true;

    this.leavePlanService.createLeavePlan(payload).subscribe({
      next: (res) => {
        console.log('Leave Plan Created:', res);
        this.loading = false;
        this.leavePlanForm.reset();
        this.allocations.clear();
        this.addAllocation();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }

  loadLeavePlans(): void {
    this.loadingPlans = true;

    this.leavePlanService.getLeavePlans().subscribe({
      next: (res) => {
        this.leavePlans = res;
        this.loadingPlans = false;
        console.log('Leave Plans:', res);
      },
      error: () => (this.loadingPlans = false),
    });
  }
}
