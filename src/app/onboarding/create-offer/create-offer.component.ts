import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, IonicModule, IonPopover } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private candidateService: CandidateDetailsService // ✅ Updated service injected
  ) {
    const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras.state?.['candidate'] || {};
    console.log('🧾 Candidate:', this.candidate);
  }

  ngOnInit() {
    // Subscribe to query params to fill missing data (e.g. on refresh)
    this.route.queryParams.subscribe(params => {
      if (params['candidate_id']) {
        // Merge or set candidate details from query params
        this.candidate = {
          ...this.candidate,
          id: this.candidate.id || params['candidate_id'],
          candidate_id: this.candidate.candidate_id || params['candidate_id'],
          FirstName: this.candidate.FirstName || params['FirstName'] || this.candidate.full_name,
          JobTitle: this.candidate.JobTitle || params['JobTitle'] || this.candidate.designation_name,
          Department: this.candidate.Department || params['Department'] || this.candidate.department_name,
          BusinessUnit: this.candidate.BusinessUnit || params['BusinessUnit'] || this.candidate.BusinessUnit,
          JobLocation: this.candidate.JobLocation || params['JobLocation'] || this.candidate.location_name,
          Email: this.candidate.Email || params['Email'],
          PhoneNumber: this.candidate.PhoneNumber || params['PhoneNumber'],
          WorkType: this.candidate.WorkType || params['WorkType']
        };
        console.log('📋 Normalized Candidate:', this.candidate);
      }
    });

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
        Email: this.candidate?.personalDetails?.Email || this.candidate?.Email,
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

          // ✅ Navigate using ID and Name (handles different property locations)
          this.router.navigate(
            [
              '/salaryStaructure',
              this.candidate?.candidate_id || this.candidate?.id || res?.data?.candidate_id,
              encodeURIComponent(this.candidate?.personalDetails?.FirstName || this.candidate?.FirstName || 'User')
            ],
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
