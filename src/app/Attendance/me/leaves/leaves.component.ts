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
  leaves: any[] = [];
  IsOpenleavePopup = false;

  constructor(
    private candidateService: CandidateService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    // Subscribe to current candidate
    this.candidateService.currentCandidate$.subscribe(user => {
      this.currentCandidate = user;
      if (this.currentCandidate) {
        this.loadLeaves(this.currentCandidate.employee_id);
      }
    });

    // Fallback for page refresh
    if (!this.currentCandidate) {
      const stored = localStorage.getItem('loggedInCandidate');
      console.log('Retrieved from localStorage:', stored);
      if (stored) {
        this.currentCandidate = JSON.parse(stored);
        this.loadLeaves(this.currentCandidate.employee_id);
      }
    }
  }

  leavesSummary: any = null;

  loadLeaves(employeeId: number) {
    this.leaveService.getLeaves(employeeId).subscribe(
      (response) => {
        console.log('Leaves fetched successfully:', response);
        if (response && response.length > 0) {
          const leave = response[0];
          this.leavesSummary = {
          casual: {
            used: leave.casual_leave_used || 0,
            total: leave.casual_leave_allocated || 0
          },
          marriage: {
            used: leave.marriage_leave_used || 0,
            total: leave.marriage_leave_allocated || 0
          },
          sick: {
            used: leave.sick_leave_used || 0,
            total: leave.sick_leave_allocated || 0
          },
          compOffs: {
            used: leave.comp_offs_used || 0,
            total: leave.comp_offs_allocated || 0
          },
          unpaid: {
            used: leave.paid_leave_used || 0,
            total: leave.paid_leave_allocated || 0
          }
        };
      }
    },
    (error) => {
      console.error('Error fetching leaves:', error);
    }
  );
  } 


  openLeaveModal() {
    this.IsOpenleavePopup = true;
  }

  closeleavePopup() {
    this.IsOpenleavePopup = false;
  }
}
