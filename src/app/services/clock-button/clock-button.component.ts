import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

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
     

      <!-- CLOCK IN -->
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
export class ClockButtonComponent implements OnInit, OnDestroy {
  currentUrl: any;
  /* kept only to avoid template errors */
  @Input() record: any;
  @Output() statusChanged = new EventEmitter<any>();

  /** true → show Clock-Out */
  isClockedIn = false;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private attendanceApi: AttendanceApiService
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    console.log('🔔 Clock button initialized on:', this.currentUrl);

    // Subscribe to shared clock state
    this.subscribeToClockState();

    // Load initial state
    this.loadLastPunch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================= SUBSCRIBE TO CLOCK STATE ================= */
  private subscribeToClockState(): void {
    this.attendanceApi.clockState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isClockedIn: boolean) => {
        console.log('🔔 Clock state received on', this.currentUrl, ':', isClockedIn);
        this.isClockedIn = isClockedIn;
      });
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
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          // State is updated by service via tap operator
          this.statusChanged.emit(res);
          console.log('✅ Clocked In successfully on', this.currentUrl);
        }
      },
      error: (err: any) => {
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
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          // State is updated by service via tap operator
          this.statusChanged.emit(res);
          console.log('✅ Clocked Out successfully on', this.currentUrl);
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Clock-Out failed');
      },
    });
  }
}
