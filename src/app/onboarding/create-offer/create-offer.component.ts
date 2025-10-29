import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, IonPopover } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { OnboardingMainheaderComponent } from '../onboarding-mainheader/onboarding-mainheader.component';
import { CreateOfferHeaderComponent } from '../create-offer-header/create-offer-header.component';
import { CandidateDetailsService } from '../../services/candidate-details-service.service'; // ✅ Use new service

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderComponent,
    OnboardingMainheaderComponent,
    CreateOfferHeaderComponent
  ]
})
export class CreateOfferComponent implements OnInit {
  @Input() candidate: any = {};
  offerForm!: FormGroup;
  selectedDate: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private candidateService: CandidateDetailsService // ✅ Updated service injected
  ) {
    const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras.state?.['candidate'] || {};
    console.log('🧾 Candidate:', this.candidate);
  }

  ngOnInit() {
    if (!this.candidate.offerDetails) {
      this.candidate.offerDetails = { DOJ: '', offerValidity: '' };
    }

    this.offerForm = this.fb.group({
      DOJ: [this.candidate.offerDetails.DOJ || '', Validators.required],
      offerValidity: [this.candidate.offerDetails.offerValidity || '', [Validators.required, Validators.min(1)]]
    });

    this.selectedDate = this.candidate.offerDetails.DOJ || '';
  }

  /** 📅 Date picker handler */
  onDateChange(event: any, popover: IonPopover) {
    const value = event.detail.value;
    if (value) {
      const date = new Date(value);
      const formatted = date.toLocaleDateString('en-GB'); // DD/MM/YYYY
      this.selectedDate = formatted;
      this.candidate.offerDetails.DOJ = formatted;
      this.offerForm.patchValue({ DOJ: formatted });
    }
    popover.dismiss();
  }

  /** 🧠 Convert DD/MM/YYYY → YYYY-MM-DD */
  private formatDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // already formatted
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /** ✅ Submit Offer Form */
  submitOfferForm() {
    if (this.offerForm.valid) {
      const formattedJoiningDate = this.formatDate(this.offerForm.value.DOJ) || '';

      const offerPayload = {
        Email: this.candidate?.personalDetails?.Email || this.candidate?.Email, // fallback
        JoiningDate: formattedJoiningDate,
        OfferValidity: this.offerForm.value.offerValidity
      };

      if (!offerPayload.Email) {
        alert('❌ Candidate Email not found!');
        return;
      }

      console.log('📤 Sending Offer Details:', offerPayload);

      this.candidateService.createOfferDetails(offerPayload).subscribe({
        next: (res: any) => {
          console.log('✅ Offer details saved successfully:', res);
          alert('Offer details saved successfully!');
          this.router.navigate(
            ['/salaryStaructure', this.candidate.id, encodeURIComponent(this.candidate.FirstName || 'User')],
            { state: { candidate: this.candidate } }
          );
        },
        error: (err: any) => {
          console.error('❌ Error saving offer details:', err);
          alert('Failed to save offer details.');
        }
      });
    } else {
      alert('Please fill all required fields!');
    }
  }
}
