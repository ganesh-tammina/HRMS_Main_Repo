import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import moment from 'moment';
// ✅ Import all Ionic components you are using

import { IonicModule } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ClockButtonComponent } from '../services/clock-button/clock-button.component';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonicModule,
    ClockButtonComponent

  ]
})
export class HomePage implements OnInit {
  days: { date: string, status: 'Complete' | 'Remaining' }[] = [];
  currentCandidate: any
  currentTime: string = '';
  constructor(private candidateService: CandidateService) { }
  ngOnInit() {
    this.candidateService.currentCandidate$.subscribe(user => {
      this.currentCandidate = user;
      console.log('Current Candidate:', this.currentCandidate);
    });
    const today = moment();
    for (let i = 0; i < 7; i++) {
      const day = today.clone().add(i, 'days');
      const status = day.isBefore(moment(), 'day') ? 'Complete' :
        day.isSame(moment(), 'day') ? 'Complete' :
          'Remaining';
      this.days.push({
        date: day.format('ddd'),
        status
      });
    }
    const now = new Date();
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
    }, 1000);
  }

  backgroundImageUrl: string = '../../assets/holidays-pics/holidays-img.svg';
}





