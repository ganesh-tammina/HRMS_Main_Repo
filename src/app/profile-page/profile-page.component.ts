import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';

import { IonicModule } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    IonicModule,
  ]
})
export class ProfilePageComponent  implements OnInit {
  currentCandidate: any;
  currentCandidate$!: Observable<any>;
  constructor(private candidateService: CandidateService) {  }

  ngOnInit() {
    this.candidateService.currentCandidate$.subscribe((user:any) => {
      this.currentCandidate = user;
      console.log('Current Candidate:', this.currentCandidate);
    });
  }

}
