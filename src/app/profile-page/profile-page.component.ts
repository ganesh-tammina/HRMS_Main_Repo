import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../shared/header/header.component';
import { CandidateService } from '../services/pre-onboarding.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent,
  ],
})
export class ProfilePageComponent implements OnInit {
  currentemp: any = []; // Single employee object

  constructor(
    private candidateService: CandidateService,
    private routeGuardService: RouteGuardService
  ) { }

  ngOnInit() {
    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          if (response?.data?.length > 0) {
            this.currentemp = response.data[0]; // ✅ Pick first employee object
            console.log('✅ Employee Details:', this.currentemp);
          } else {
            console.warn('⚠️ No employee data found in response');
          }
        },
        error: (err) => {
          console.error('❌ Error fetching employee details:', err);
        },
      });
    } else {
      console.warn('⚠️ No employeeID found in routeGuardService');
    }
  }
}
