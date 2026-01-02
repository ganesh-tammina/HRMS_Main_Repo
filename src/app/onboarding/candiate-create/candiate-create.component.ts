import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  maxDOB = new Date().toISOString();

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.autoFullName();
    this.loadSavedData();
  }

  /* ================= FORM ================= */
  initForm() {
    this.candidateForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      full_name: [{ value: '', disabled: true }],

      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      alternate_phone: [''],

      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required],

      recruitment_source: ['LinkedIn']
    });
  }

  /* ================= AUTO FULL NAME ================= */
  autoFullName() {
    this.candidateForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        const fullName = [val.first_name, val.middle_name, val.last_name]
          .filter(Boolean)
          .join(' ');
        this.candidateForm.get('full_name')
          ?.setValue(fullName, { emitEvent: false });
      });
  }

  /* ================= LOAD SAVED (IF BACK) ================= */
  loadSavedData() {
    const saved = localStorage.getItem('candidate_personal_details');
    if (saved) {
      this.candidateForm.patchValue(JSON.parse(saved));
    }
  }

  /* ================= SUBMIT ================= */
  submitForm() {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched();
      this.showToast('Please fill all required fields', 'danger');
      return;
    }

    this.submitting = true;

    const personalDetails = {
      ...this.candidateForm.getRawValue()
    };

    localStorage.setItem(
      'candidate_personal_details',
      JSON.stringify(personalDetails)
    );

    this.submitting = false;

    this.showToast('Personal details saved successfully', 'success');

    this.modalCtrl.dismiss({
      step: 'personal',
      data: personalDetails
    });
  }

  /* ================= TOAST ================= */
  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
