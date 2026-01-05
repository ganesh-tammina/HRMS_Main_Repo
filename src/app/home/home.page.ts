import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import moment from 'moment';
import { IonicModule, AlertController } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { ClockButtonComponent } from '../services/clock-button/clock-button.component';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { environment } from 'src/environments/environment';
import { RouterLink, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, ClockButtonComponent, RouterLink],
})
export class HomePage implements OnInit {

  private static readonly REFRESH_DELAY_MS = 10;

  /* ================= EXISTING ================= */
  days: { date: string; status: 'Complete' | 'Remaining' }[] = [];
  currentEmployee: any;
  one: any;
  full_name: string = '';
  currentTime: string = '';
  allEmployees: any[] = [];
  fullName: any;
  currentemp: any;
  employee_id: any;
  uploadedImageUrl: string | null = null;
  imageUrls: any;
  profileimg: string = environment.apiURL;
  backgroundImageUrl: string = '../../assets/holidays-pics/christmas_pic.svg';

  /* ================= NEW (ONLY REQUIRED) ================= */
  greeting: string = '';
  todayDate: string = '';
  workMode: string = 'On-Site';

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private routeGuardService: RouteGuardService,
    private router: Router
  ) { }

  ngOnInit() {

    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      localStorage.removeItem('showLoginSuccess');
      this.showLoginSuccessAlert();
    }

    /* ✅ SET GREETING */
    this.setGreeting();

    /* ✅ SET DATE */
    this.todayDate = moment().format('dddd, MMMM DD, YYYY');

    /* ================= EXISTING LOGIC ================= */
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

  /* ================= GREETING LOGIC ================= */
  setGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  async showLoginSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Information',
      message: 'Login Successful',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            setTimeout(() => { }, HomePage.REFRESH_DELAY_MS);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  attendance() {
    this.router.navigate(['/Me']);
  }

  leaves() {
    this.router.navigate(['/leaves']);
  }

  myteam() {
    this.router.navigate(['/MyTeam']);
  }
}
