import {
  Component,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AttendanceApiService } from '../attendance-api.service';

@Component({
  selector: 'app-clock-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="ion-text-center">

      <!-- CLOCK IN -->
      <ion-button
        *ngIf="!isClockedIn"
        color="success"
        [disabled]="loading"
        (click)="clockIn()">
        Web Clock-In
      </ion-button>

      <!-- CLOCK OUT -->
      <ion-button
        *ngIf="isClockedIn"
        color="danger"
        [disabled]="loading"
        (click)="clockOut()">
        Web Clock-Out
      </ion-button>

    </div>
  `,
})
export class ClockButtonComponent implements OnInit {

  @Output() statusChanged = new EventEmitter<any>();

  /** true → show Clock-Out */
  isClockedIn = false;
  loading = false;

  constructor(private attendanceApi: AttendanceApiService) { }

  ngOnInit(): void {
    this.loadLastPunch();
  }

  /* ======================
   * GET LAST PUNCH OBJECT
   * ====================== */
  private loadLastPunch(): void {
    this.attendanceApi.getTodayAttendance().subscribe({
      next: (res) => {
        const punches = res?.punches || [];

        if (!punches.length) {
          this.isClockedIn = false;
          return;
        }

        const lastPunch = punches[punches.length - 1];
        this.isClockedIn = lastPunch.punch_type === 'in';
      },
      error: () => {
        this.isClockedIn = false;
      }
    });
  }

  /* ================= CLOCK IN ================= */
  clockIn(): void {
    this.loading = true;

    this.attendanceApi.apiPunchIn({
      work_mode: 'Office',
      location: 'Mumbai Office',
      notes: 'Morning shift',
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.isClockedIn = true;
          this.statusChanged.emit(res);
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Clock-In failed');
      },
    });
  }

  /* ================= CLOCK OUT ================= */
  clockOut(): void {
    this.loading = true;

    this.attendanceApi.apiPunchOut({
      notes: 'Going for lunch',
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.isClockedIn = false;
          this.statusChanged.emit(res);
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Clock-Out failed');
      },
    });
  }
}
