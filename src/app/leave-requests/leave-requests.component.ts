import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../services/pre-onboarding.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss'],
  standalone: true,
  imports: [],
})
export class LeaveRequestsComponent implements OnInit {

  constructor(private candidateService: CandidateService) { }

  ngOnInit() {
    this.candidateService.getLeaveRequests('').subscribe((data) => console.log(data));
   }

}
