import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Candidate_Create_Service } from 'src/app/services/Candidate/candidate.service';
import { AdminService } from 'src/app/services/admin-functionality/admin.service.service';

@Component({
  selector: 'app-candiate-create',
  standalone: true,
  templateUrl: './candiate-create.component.html',
  styleUrls: ['./candiate-create.component.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class CandiateCreateComponent implements OnInit, OnDestroy {

  candidateForm!: FormGroup;
  submitting = false;

  designations: any[] = [];
  departments: any[] = [];
  locations: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private candidateService: Candidate_Create_Service,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadMasters();
    this.autoFullName();
  }

  initForm() {
    this.candidateForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      full_name: [{ value: '', disabled: true }, Validators.required],

      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      alternate_phone: [''],

      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required],
      position: ['', Validators.required],

      designation_id: [null, Validators.required],
      department_id: [null, Validators.required],
      location_id: [null, Validators.required],

      offered_ctc: [null, Validators.required],
      joining_date: ['', Validators.required],
      reporting_manager_id: [null, Validators.required],
      recruiter_name: ['', Validators.required],

      recruitment_source: ['LinkedIn', Validators.required],
    });
  }

  loadMasters() {
    this.adminService.getDesignations().subscribe(r => this.designations = r);
    this.adminService.getDepartments().subscribe(r => this.departments = r);
    this.adminService.getLocations().subscribe(r => this.locations = r);
  }

  autoFullName() {
    this.candidateForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        const fullName = [val.first_name, val.middle_name, val.last_name]
          .filter(Boolean)
          .join(' ');
        this.candidateForm.get('full_name')?.setValue(fullName, { emitEvent: false });
      });
  }

  submitForm() {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      ...this.candidateForm.getRawValue()
    };

    this.candidateService.createCandidate(payload).subscribe({
      next: res => {
        this.submitting = false;
        this.modalCtrl.dismiss({ created: true, data: res });
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
