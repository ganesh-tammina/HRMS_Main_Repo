import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/header/header.component';
import { EmployeeHeaderComponent } from '../employee-header/employee-header.component';
import { CandidateService } from '../../../services/pre-onboarding.service';
import { LeaveService } from '../../../services/leave.service';
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
  leaveData: any = null;

  constructor(
    private candidateService: CandidateService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    // Subscribe to current employee stream
    this.candidateService.currentEmployee$.subscribe(emp => {
      if (emp) {
        this.currentCandidate = emp;
        this.loadLeaves();
      } else {
        // Fallback: check localStorage
        const stored = localStorage.getItem('employee_details');
        if (stored) {
          let parsed = JSON.parse(stored);
          while (Array.isArray(parsed)) {
            parsed = parsed[0];
          }
          this.currentCandidate = parsed;
          this.loadLeaves();
        }
      }

      console.log('Current Employee:', this.currentCandidate);
    });
  }

  loadLeaves() {
    if (this.currentCandidate && this.currentCandidate.employee_id) {
      this.leaveService.getLeaves(this.currentCandidate.employee_id).subscribe({
        next: (data) => {
          // If backend returns an array, take the first object
          this.leaveData = Array.isArray(data) ? data[0] : data;
          console.log('Leave Data:', this.leaveData);
        },
        error: (err) => {
          console.error('Error fetching leave data:', err);
        }
      });
    }
  }

  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
  }
}
