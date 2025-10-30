import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { IonicModule } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-candidate-offer-letter',
  templateUrl: './candidate-offer-letter.component.html',
  styleUrls: ['./candidate-offer-letter.component.scss'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, IonicModule, ReactiveFormsModule]
})
export class CandidateOfferLetterComponent implements OnInit {
  currentCandidate: any
  activePage: string = 'openPage';
  candidate: any;
  ids: string = ''
  acceptDisabled = false;
  rejectDisabled = false;
  currentCandidate$!: Observable<any>;
  onboardingForms!: FormGroup


  constructor(private candidateService: CandidateService, private router: Router, private http: HttpClient, private alertController: AlertController, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras.state?.['candidate'] || {};
    console.log('Candidate:', this.candidate);

    this.onboardingForms = this.fb.group({
      PhoneNumber: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('🔍 Candidate ID from route:', id);

      if (id) {
        this.candidateService.getCandidateById(id).subscribe({
          next: (res: any) => {
            // API returns `{ success: true, candidate: {...} }`
            this.candidate = res.candidate;
            console.log('Candidate fetched from backend:', this.candidate);
          },
          error: (err) => {
            console.error('❌ Error fetching candidate:', err);
          }
        });
      }
    });


  }



  async acceptCandidate(candidateId: number) {
    this.rejectDisabled = true;
    const alert = await this.alertController.create({
      header: 'Accept Candidate',
      message: `You accepted candidate with ID: ${candidateId}`,
      buttons: ['OK'],
    });

    try {
      const url = `http://localhost:3562/offerstatus/accept`;
      const response = await this.http.put(url, { id: candidateId }).toPromise();
      console.log('Accept response:', response);
    } catch (error) {
      console.error('Error accepting candidate:', error);
    }

    await alert.present();
  }

  async rejectCandidate(candidateId: number) {
    this.acceptDisabled = true;
    const alert = await this.alertController.create({
      header: 'Reject Candidate',
      message: `You rejected candidate with ID: ${candidateId}`,
      buttons: ['OK'],
    });

    try {
      const url = `http://localhost:3562/offerstatus/reject`;
      const response = await this.http.put(url, { id: candidateId }).toPromise();
      console.log('Reject response:', response);
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }

    await alert.present();
  }





}

