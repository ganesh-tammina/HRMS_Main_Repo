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
  selector: 'app-candidate-status',
  templateUrl: './candidate-status.component.html',
  styleUrls: ['./candidate-status.component.scss'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, IonicModule, ReactiveFormsModule]
})
export class CandidateStatusComponent implements OnInit {
  currentCandidate: any;
  activePage: string = 'openPage';
  hideOffer: boolean = false;
  candidate: any = {};
  onboardingForms!: FormGroup;
 

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // ✅ Initialize form
    this.onboardingForms = this.fb.group({
      PhoneNumber: ['', Validators.required]
    });

    // ✅ Get candidate data from navigation (if sent via state)
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['candidate']) {
      this.candidate = nav.extras.state['candidate'];
      console.log('📦 Candidate from navigation:', this.candidate);
    }

    // ✅ Get candidate ID from route if available
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

  // ✅ Verify phone number and navigate
 submitOnboarding() {
  const enteredPhone = this.onboardingForms.value.PhoneNumber;
  const actualPhone = this.candidate?.PhoneNumber;

  if (enteredPhone === actualPhone) {
    console.log('✅ Phone verified. Navigating to offer details...');

    // Pass ID in URL + full object in query params
    this.router.navigate(
      ['/candidate-offer-letter', this.candidate.Candidate_ID],
      {
        queryParams: {
          data: JSON.stringify(this.candidate)
        }
      }
    );

  } else {
    this.showAlert('Please enter a valid Phone Number');
  }
}
  // ✅ Ionic Alert
  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Validation Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
