import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController, IonPopover } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidateDetailsService, Candidate } from '../../services/candidate-details-service.service';
import { IntlPhoneValidatorFactory, toE164, formatAsYouType } from 'src/app/validators/phone-validators';
import { CountryCode } from 'libphonenumber-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-candiate-create',
  templateUrl: './candiate-create.component.html',
  styleUrls: ['./candiate-create.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CandiateCreateComponent implements OnInit, OnDestroy {
  candidateForm!: FormGroup;
  selectedDate: string | null = null;

  // Use typed CountryCode to satisfy libphonenumber-js typings
  defaultCountry: CountryCode = 'IN';
  phonePreview = '';
  submitting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private candidateDetailsService: CandidateDetailsService
  ) { }

  ngOnInit() {
    this.candidateForm = this.fb.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      // wire the Google phone validator factory with a typed country
      PhoneNumber: ['', [Validators.required, IntlPhoneValidatorFactory(this.defaultCountry)]],
      Email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/)]],
      Gender: ['', Validators.required],
      JobTitle: ['', Validators.required],
      Department: ['', Validators.required],
      JobLocation: ['', Validators.required],
      WorkType: ['', Validators.required],
      BusinessUnit: ['', Validators.required],
      DateOfBirth: ['']
    });

    // update formatted preview as user types (non-invasive)
    this.candidateForm.get('PhoneNumber')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => {
        this.phonePreview = formatAsYouType(v ?? '', this.defaultCountry);
      });
  }

  get f() {
    return this.candidateForm.controls;
  }

  submitForm() {
    if (!this.candidateForm.valid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    // Normalize phone to E.164 using helper (returns null if invalid)
    const rawPhone = this.candidateForm.get('PhoneNumber')?.value;
    const phoneE164 = toE164(rawPhone, this.defaultCountry);

    if (!phoneE164) {
      // defensive: validator should have prevented this, but set error and stop
      this.candidateForm.get('PhoneNumber')?.setErrors({ invalidPhone: true });
      this.submitting = false;
      return;
    }

    const candidateData: Candidate = {
      ...this.candidateForm.value,
      PhoneNumber: phoneE164
    };

    console.log('Form Data (normalized):', candidateData);

    this.candidateDetailsService.createCandidate(candidateData).subscribe({
      next: (res) => {
        console.log('✅ Candidate created:', res);
        this.submitting = false;
        // Dismiss and return created candidate so caller can update its list gracefully
        this.modalCtrl.dismiss({ created: true, candidate: res });
      },
      error: (err) => {
        console.error('❌ Error creating candidate:', err);
        this.submitting = false;
      }
    });
  }

  close() {
    this.modalCtrl.dismiss({ created: false });
  }

  onDateChange(event: any, popover?: IonPopover) {
    const value = event?.detail?.value;
    if (value) {
      const date = new Date(value);
      const formatted = date.toLocaleDateString('en-GB'); // dd/MM/yyyy
      this.selectedDate = formatted;
      this.candidateForm.patchValue({ DateOfBirth: date.toISOString() });
    }
    popover?.dismiss();
  }

  onPhoneBlur() {
    // optional: format display to national format on blur (no effect on stored E.164)
    const raw = this.candidateForm.get('PhoneNumber')?.value;
    const formatted = formatAsYouType(raw ?? '', this.defaultCountry);
    if (formatted) {
      // update control for display without triggering preview subscription
      this.candidateForm.get('PhoneNumber')?.setValue(formatted, { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
