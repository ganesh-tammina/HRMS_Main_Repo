import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { IonicModule, AlertController } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-candidate-offer-letter',
  templateUrl: './candidate-offer-letter.component.html',
  styleUrls: ['./candidate-offer-letter.component.scss'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, IonicModule, ReactiveFormsModule],
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
    // Create form
    this.onboardingForms = this.fb.group({
      PhoneNumber: ['', Validators.required],
    });

    // Try to get candidate from navigation
    const nav = this.router.getCurrentNavigation();
    const stateCandidate = nav?.extras.state?.['candidate'];

    if (stateCandidate) {
      this.candidate = stateCandidate;
      console.log('✅ Candidate from navigation:', this.candidate);
    }

    // Get ID from route and fetch candidate if needed
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        console.log('🔍 Candidate ID from route:', id);
        this.loadCandidateById(id);
      }
    });
  }

  loadCandidateById(id: string) {
    this.candidateService.getCandidateById(id).subscribe({
      next: (res: any) => {
        // handle both backend response formats
        this.candidate = res?.candidate || res;
        console.log('✅ Candidate fetched from backend:', this.candidate);
      },
      error: (err) => {
        console.error('❌ Error fetching candidate:', err);
      },
    });
  }

  async acceptCandidate(candidateId: number) {
    this.rejectDisabled = true;

    try {
      const url = `http://localhost:3562/offerstatus/accept`;
      const response = await this.http.put(url, { id: candidateId }).toPromise();
      console.log('✅ Accept response:', response);

      const alert = await this.alertController.create({
        header: 'Candidate Accepted',
        message: `You accepted candidate with ID: ${candidateId}`,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('❌ Error accepting candidate:', error);
    }
  }

  async rejectCandidate(candidateId: number) {
    this.acceptDisabled = true;

    try {
      const url = `http://localhost:3562/offerstatus/reject`;
      const response = await this.http.put(url, { id: candidateId }).toPromise();
      console.log('✅ Reject response:', response);

      const alert = await this.alertController.create({
        header: 'Candidate Rejected',
        message: `You rejected candidate with ID: ${candidateId}`,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('❌ Error rejecting candidate:', error);
    }
  }
}
