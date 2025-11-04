import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';

import { IonicModule } from '@ionic/angular';
import { CandidateService, Employee } from '../services/pre-onboarding.service';
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
export class ProfilePageComponent implements OnInit {
  currentemp: any;
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {
    this.currentEmployee$ = this.candidateService.currentEmployee$;

    this.currentEmployee$.subscribe((emp: any) => {
      if (Array.isArray(emp) && emp.length > 0) {
        this.currentemp = emp[0]; // ✅ pick first employee object
      } else {
        this.currentemp = emp; // if it's already a single object
      }

      console.log('Current Employee:', this.currentemp);
    });
  }

}
