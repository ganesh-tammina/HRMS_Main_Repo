import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { IonicModule, AlertController } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-candidate-offer-letter',
  templateUrl: './candidate-offer-letter.component.html',
  styleUrls: ['./candidate-offer-letter.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class CandidateOfferLetterComponent implements OnInit {
  candidate: any = {};
  acceptDisabled = false;
  rejectDisabled = false;
  onboardingForms!: FormGroup;

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // Initialize form
    this.onboardingForms = this.fb.group({
      PhoneNumber: ['', Validators.required],
    });

    // Get candidate from navigation state (if available)
    const nav = this.router.getCurrentNavigation();
    const stateCandidate = nav?.extras.state?.['candidate'];

    if (stateCandidate) {
      this.candidate = stateCandidate;
      console.log('✅ Candidate from navigation:', this.candidate);
    }

    // Fetch candidate by route param (if not passed through navigation)
  this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.candidateService.getCandidateById(id).subscribe({
          next: (res: any) => {
            this.candidate = res.candidate;
            console.log('✅ Candidate fetched from backend:', this.candidate);
          },
          error: (err) => {
            console.error('❌ Error fetching candidate:', err);
          }
        });
      }
    });
  }

  // 🔹 Load candidate details by ID from backend
  // loadCandidateById(id: string) {
  //   this.candidateService.getCandidateById(id).subscribe({
  //     next: (res: any) => {
  //       this.candidate = res?.candidate || res;
  //       console.log('✅ Candidate fetched from backend:', this.candidate.candidate_id);
  //     },
  //     error: (err) => {
  //       console.error('❌ Error fetching candidate:', err);
  //     },
  //   });
  // }

  // 🔹 Accept candidate offer and navigate to OfferDetails
  async acceptCandidate(candidateId: number) {
    this.rejectDisabled = true;
    this.acceptDisabled = true;

    try {
      const url = `https://${environment.apiURL}/candidates/${this.candidate.Candidate_ID}/status`;
      const response = await this.http.put(url, { status: 'accepted' }).toPromise();
      console.log('✅ Accept response:', response);

      const alert = await this.alertController.create({
        header: 'Offer Accepted 🎉',
        message: `Welcome aboard, ${this.candidate.FirstName}!`,
        buttons: ['OK'],
      });
      await alert.present();

      // Navigate to Offer Details after acceptance
      this.router.navigate(['/offer-details'], {
        state: { candidate: this.candidate },
      });
    } catch (error) {
      console.error('❌ Error accepting candidate:', error);
      this.acceptDisabled = false;
      this.rejectDisabled = false;
    }
  }

  // 🔹 Reject candidate offer
  async rejectCandidate(candidate: number) {
    this.acceptDisabled = true;
    this.rejectDisabled = true;

    try {
      const url = `https://${environment.apiURL}/candidates/${this.candidate.Candidate_ID}/status`;
      const response = await this.http.put(url, { status: 'rejected' }).toPromise();
      console.log('✅ Reject response:', response);

      const alert = await this.alertController.create({
        header: 'Offer Rejected',
        message: `You have declined the offer. Thank you for your time.`,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('❌ Error rejecting candidate:', error);
      this.acceptDisabled = false;
      this.rejectDisabled = false;
    }
  }
}
