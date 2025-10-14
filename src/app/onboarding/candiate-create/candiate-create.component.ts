import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IonPopover } from '@ionic/angular';

@Component({
  selector: 'app-candiate-create',
  templateUrl: './candiate-create.component.html',
  styleUrls: ['./candiate-create.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CandiateCreateComponent implements OnInit {
  candidateForm!: FormGroup;
  selectedDate: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private candidateService: CandidateService
  ) { }

  ngOnInit() {
    this.candidateForm = this.fb.group({
      personalDetails: this.fb.group({
        firstName: ['', Validators.required],
        MiddleName: ['', Validators.required],
        lastName: ['', Validators.required],
        PhoneNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        gender: ['', Validators.required],
        initials: ['']
      }),
      jobDetailsForm: this.fb.group({
        JobTitle: ['', Validators.required],
        Department: ['', Validators.required],
        JobLocation: ['', Validators.required],
        WorkType: ['', Validators.required],
        BussinessUnit: ['', Validators.required],
      })
    });


    const personal = this.candidateForm.get('personalDetails');

    personal?.valueChanges.subscribe((values) => {
      const first = values.FirstName?.charAt(0)?.toUpperCase() || '';
      const last = values.LastName?.charAt(0)?.toUpperCase() || '';
    });
  }

  submitForm() {
    if (this.candidateForm.valid) {
      const formData = this.candidateForm.value;
      console.log('Form Data:', formData);

      this.candidateService.createCandidate(formData).subscribe({
        next: () => {
          console.log('✅ Candidate created');
          console.log('Form Data:', formData);
          this.modalCtrl.dismiss();
          window.location.reload();
        },
        error: (err) => console.error('❌ Error:', err)
      });
    } else {
      this.candidateForm.markAllAsTouched();
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  onDateChange(event: any, popover: IonPopover) {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      const formatted = date.toLocaleDateString('en-GB'); // dd/MM/yyyy
      this.candidateForm.get('jobDetailsForm.DOJ')?.setValue(formatted);
      this.selectedDate = formatted;
    }
    popover.dismiss();
  }
}
