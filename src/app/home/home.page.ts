import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import moment from 'moment';
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
  currentEmployee: any;
  one: any;
  currentTime: string = '';
  allEmployees: any[] = [];

  backgroundImageUrl: string = '../../assets/holidays-pics/holidays-img.svg';

  constructor(private candidateService: CandidateService,
    private cdr: ChangeDetectorRef) {

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
    this.candidateService.getAllEmployees().subscribe({

      next: (response: any) => {
        this.allEmployees = response.data || [];
        console.log('All Employees:', this.allEmployees);

        // 3️⃣ Find current employee by ID
        this.currentEmployee = this.allEmployees.find(
          (emp: any) => { return this.one = emp[currentEmployeeId - 1] }
        );

        console.log('Current Employee Details:', this.one);

      },
      error: (err) => {
        console.error('Error fetching all employees:', err);
      }
    });

    // 4️⃣ Populate days for the week
    const today = moment();
    this.days = Array.from({ length: 7 }, (_, i) => {
      const day = today.clone().add(i, 'days');
      const status = day.isSameOrBefore(today, 'day') ? 'Complete' : 'Remaining';
      return { date: day.format('ddd'), status };
    });

    // 5️⃣ Start live clock
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
    }, 1000);
  }

  ngOnInit() {
    // 1️⃣ Get logged-in user from localStorage+
  }
}
