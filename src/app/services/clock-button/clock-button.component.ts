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

@Component({
  selector: 'app-clock-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="ion-text-center">

      <ion-button
        color="success"
        *ngIf="!isClockedIn"
        (click)="clockIn()">
        Web Clock-In
      </ion-button>

      <ion-button
        color="danger"
        *ngIf="isClockedIn"
        (click)="clockOut()">
        Web Clock-Out
      </ion-button>

    </div>
  `,
})
export class ClockButtonComponent implements OnInit {

  /* kept only to avoid template errors */
  @Input() record: any;
  @Output() statusChanged = new EventEmitter<any>();

  isClockedIn = false;
  private readonly STORAGE_KEY = 'EMPLOYEE_CLOCK_STATUS';

  constructor(private attendanceApi: AttendanceApiService) { }

  ngOnInit() {
    this.isClockedIn = localStorage.getItem(this.STORAGE_KEY) === 'IN';
  }

  /* ================= CLOCK IN ================= */
  clockIn() {
    this.attendanceApi.apiPunchIn({
      work_mode: 'Office',
      location: 'Mumbai Office',
      notes: 'Morning shift',
    }).subscribe({
      next: (res) => {
        if (res?.success) {
          this.isClockedIn = true;
          localStorage.setItem(this.STORAGE_KEY, 'IN');
          alert('✅ Clock-In successful');
          this.statusChanged.emit(res);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'Clock-In failed');
      },
    });
  }

  /* ================= CLOCK OUT ================= */
  clockOut() {
    this.attendanceApi.apiPunchOut({
      notes: 'Going for lunch',
    }).subscribe({
      next: (res) => {
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
