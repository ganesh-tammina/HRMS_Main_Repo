import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* 🚨 IMPORTANT: ONLY THIS SERVICE */
import { AttendanceApiService } from '../attendance-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clock-button',
  styleUrls: ['clock-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
  <div class="ion-text-left">
      <!-- Clock In Button -->
      <div class="row-center" *ngIf="!isClockedIn && currentUrl !== '/Me'">
      <ion-button
      class="btn-clockin"      
      (click)="clockIn()">
      Web Clock-In
    </ion-button></div>
     

      <ion-button
        fill="clear"
        class="clear"
        *ngIf="!isClockedIn && currentUrl == '/Me'"
        (click)="clockIn()"
      >
        <img
          src="../../assets/Icons/attendance-icons/Web clockin.svg"
          width="16"
          height="16"
        />
        Web Clock-In
      </ion-button>

      <!-- Clock Out Button -->
      <div class="row-center" *ngIf="isClockedIn && currentUrl !== '/Me'">
      <ion-button
        class="btn-clockout"        
        (click)="clockOut()">
        Web Clock-Out
      </ion-button></div>

      <ion-button
        class="btn-clockout me-clock-out"
        *ngIf="isClockedIn && currentUrl == '/Me'"
        (click)="clockOut()"
      >
        Web Clock-Out
      </ion-button>

    </div>

  `,
})
export class ClockButtonComponent implements OnInit {
  currentUrl: any;
  /* kept only to avoid template errors */
  @Input() record: any;
  @Output() statusChanged = new EventEmitter<any>();

  isClockedIn = false;
  private readonly STORAGE_KEY = 'EMPLOYEE_CLOCK_STATUS';

  constructor(
    private router: Router,
    private attendanceApi: AttendanceApiService
    ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    console.log(this.currentUrl);
    this.isClockedIn = localStorage.getItem(this.STORAGE_KEY) === 'IN';
  }

  /* ================= CLOCK IN ================= */
  clockIn() {
    this.attendanceApi.apiPunchIn({
      work_mode: 'Office',
      location: 'Mumbai Office',
      notes: 'Morning shift',
    }).subscribe({
      next: (res:any) => {
        if (res?.success) {
          this.isClockedIn = true;
          localStorage.setItem(this.STORAGE_KEY, 'IN');
          alert('✅ Clock-In successful');
          this.statusChanged.emit(res);
        }
      },
      error: (err:any) => {
        alert(err?.error?.message || 'Clock-In failed');
      },
    });
  }

  /* ================= CLOCK OUT ================= */
  clockOut() {
    this.attendanceApi.apiPunchOut({
      notes: 'Going for lunch',
    }).subscribe({
      next: (res:any) => {
        if (res?.success) {
          this.isClockedIn = false;
          localStorage.setItem(this.STORAGE_KEY, 'OUT');
          alert('✅ Clock-Out successful');
          this.statusChanged.emit(res);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'Clock-Out failed');
      },
    });
  }
}
