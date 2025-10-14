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
  selector: 'app-candidate-status',
  templateUrl: './candidate-status.component.html',
  styleUrls: ['./candidate-status.component.scss'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, IonicModule, ReactiveFormsModule]
})

export class CandidateStatusComponent implements OnInit {
  currentCandidate: any
  activePage: string = 'openPage';
  hideOffer: boolean = false
  candidate: any;
  ids: string = ''  
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
      console.log('Route param id:', id);


      if (id) {
        this.candidateService.getCandidateById(id).subscribe((data: any) => {
          this.candidate = data;
          console.log('Fetched Candidate by ID:', this.candidate);
        });
      }
      this.candidateService.currentCandidate$.subscribe(user => {
        this.currentCandidate = user;
        console.log('Current Candidate from Service:', user);
      });
    });




  }

  submitOnboarding() {
    if (this.onboardingForms.value.PhoneNumber == this.candidate.PhoneNumber) {
      // this.hideOffer = true
      this.router.navigate(
        ['/candidate-offer-letter', this.candidate.id],
        { state: { candidate: this.candidate } }
      );
    }
    else {
      alert("Please enter valid PhoneNumber")
    }

  }

 




}
