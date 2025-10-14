import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/header/header.component'
import { EmployeeHeaderComponent } from '../employee-header/employee-header.component';
import { Candidate, CandidateService } from '../../../services/pre-onboarding.service'
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HeaderComponent, EmployeeHeaderComponent]
})
export class LeavesComponent implements OnInit {
  currentCandidate: any;
  IsOpenleavePopup = false;
  constructor(private candidateService: CandidateService) { }
  ngOnInit() {
    // Subscribe to the current logged-in candidate
    this.candidateService.currentCandidate$.subscribe(user => {
      this.currentCandidate = user;

    });

    // Fallback: if page refresh, load from localStorage
    if (!this.currentCandidate) {
      const stored = localStorage.getItem('loggedInCandidate');
      if (stored) {
        this.currentCandidate = JSON.parse(stored);
      }
    }
  }
  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
  }
}
