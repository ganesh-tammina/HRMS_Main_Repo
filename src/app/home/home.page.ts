import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import moment from 'moment';
import { IonicModule, AlertController } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ClockButtonComponent } from '../services/clock-button/clock-button.component';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, ClockButtonComponent],
})
export class HomePage implements OnInit {
  private static readonly REFRESH_DELAY_MS = 10; // Virtually instant refresh delay

  days: { date: string; status: 'Complete' | 'Remaining' }[] = [];
  currentEmployee: any;
  one: any;
  full_name: string = ""
  currentTime: string = '';
  allEmployees: any[] = [];
  fullName: any;
  currentemp: any;
  employee_id: any;
  uploadedImageUrl: string | null = null;
  imageUrls: any;

  backgroundImageUrl: string = '../../assets/holidays-pics/holidays-img.svg';

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private routeGuardService: RouteGuardService,
  ) {
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) {
      console.error('No logged-in user in localStorage');
      return;
    }

    const loggedInUser = JSON.parse(loggedInUserStr);
    const currentEmployeeId = loggedInUser?.employee_id;
    if (!currentEmployeeId) {
      console.error('No employee_id found for logged-in user');
      return;
    }
    console.log('Current Employee ID:', currentEmployeeId);
  }

  ngOnInit() {

    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          this.allEmployees = response.data || [];
          if (this.allEmployees.length > 0) {
            this.one = this.allEmployees[0];
            this.fullName = this.one[0].reporting_to;
            this.employee_id = this.one[0].employee_id;

            console.log('profile', this.imageUrls);
            localStorage.setItem('employee_id', this.employee_id);
            this.candidateService.setLoggedEmployeeId(this.employee_id);
            console.log(this.fullName);
            this.currentemp = this.one[0];

            console.log(this.currentemp);
          }
        },
        error: (err) => {
          console.error('Error fetching all employees:', err);
        },
      });
      // Subscribe to current candidate observable

      // Fallback: if page refreshed
    }

    // Check if we should show login success popup
    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      localStorage.removeItem('showLoginSuccess');
      this.showLoginSuccessAlert();
    }

    const today = moment();
    this.days = Array.from({ length: 7 }, (_, i) => {
      const day = today.clone().add(i, 'days');
      const status = day.isSameOrBefore(today, 'day')
        ? 'Complete'
        : 'Remaining';
      return { date: day.format('ddd'), status };
    });
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: true,
      });
    }, 1000);
  }

  async showLoginSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Information',
      message: 'Login Successful',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // Instant seamless refresh without clearing localStorage
            setTimeout(() => {
              window.location.reload();
            }, HomePage.REFRESH_DELAY_MS);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}
