import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, IonPopover } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CandidateDetailsService, Candidate } from '../../services/candidate-details-service.service';

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
    private candidateDetailsService: CandidateDetailsService
  ) { }

  ngOnInit() {
    this.candidateForm = this.fb.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Gender: ['', Validators.required],
      JobTitle: ['', Validators.required],
      Department: ['', Validators.required],
      JobLocation: ['', Validators.required],
      WorkType: ['', Validators.required],
      BusinessUnit: ['', Validators.required],
    });
  }

  submitForm() {
    if (this.candidateForm.valid) {
      const candidateData: Candidate = this.candidateForm.value;
      console.log('Form Data:', candidateData);

      this.candidateDetailsService.createCandidate(candidateData).subscribe({
        next: (res) => {
          console.log('✅ Candidate created:', res);
          this.modalCtrl.dismiss();
          window.location.reload();
        },
        error: (err) => console.error('❌ Error creating candidate:', err)
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
      this.selectedDate = formatted;
    }
    popover.dismiss();
  }
}
