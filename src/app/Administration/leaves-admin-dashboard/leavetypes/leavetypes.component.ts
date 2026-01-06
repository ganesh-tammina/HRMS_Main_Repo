import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LeaveTypeService } from 'src/app/services/leavetype.service';

@Component({
  selector: 'app-leavetypes',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './leavetypes.component.html',
  styleUrls: ['./leavetypes.component.scss'],
})
export class LeavetypesComponent implements OnInit {

  leaveTypeForm!: FormGroup;
  leaveTypes: any[] = [];
  loading = false;
  listLoading = false;
  showCreateForm = false;

  constructor(
    private fb: FormBuilder,
    private leaveTypesService: LeaveTypeService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadLeaveTypes();
  }

  private initForm(): void {
    this.leaveTypeForm = this.fb.group({
      type_name: ['', Validators.required],
      type_code: ['', Validators.required],
      is_paid: [true],
      requires_approval: [true],
      can_carry_forward: [false],
      max_carry_forward_days: [0],
      description: [''],
    });
  }
    openCreateForm(): void {
    this.showCreateForm = true;
  }
    cancelCreate(): void {
    this.showCreateForm = false;
    this.leaveTypeForm.reset({ status: 'Active' });
  }


  /** CREATE */
  submit(): void {
    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.leaveTypesService.createLeaveType(this.leaveTypeForm.value).subscribe({
      next: async () => {
        this.loading = false;
        this.leaveTypeForm.reset({
          is_paid: true,
          requires_approval: true,
          can_carry_forward: false,
          max_carry_forward_days: 0,
        });

        this.loadLeaveTypes(); // 🔄 refresh list

        const toast = await this.toastCtrl.create({
          message: 'Leave Type created successfully',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.showCreateForm = false;
      },
      error: async () => {
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: 'Failed to create Leave Type',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }

  /** GET LIST */
  loadLeaveTypes(): void {
    this.listLoading = true;

    this.leaveTypesService.getLeaveTypes().subscribe({
      next: (res) => {
        this.leaveTypes = res || [];
        this.listLoading = false;
      },
      error: () => {
        this.listLoading = false;
      },
    });
  }
}
