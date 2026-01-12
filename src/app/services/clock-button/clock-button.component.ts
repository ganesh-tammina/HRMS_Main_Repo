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


      <!-- Clock Out Button - Regular (Office/Remote) -->
      <div class="row-center" *ngIf="isClockedIn && (workMode === 'Office' || (remoteActive && workMode === 'Remote')) && currentUrl !== '/Me'">
        <ion-button
          class="btn-clockout"        
          (click)="clockOut()">
          {{ remoteActive && workMode === 'Remote' ? 'Remote Clock-Out' : 'Web Clock-Out' }}
        </ion-button>
      </div>

      <ion-button
        class="btn-clockout me-clock-out"
        *ngIf="isClockedIn && (workMode === 'Office' || (remoteActive && workMode === 'Remote')) && currentUrl == '/Me'"
        (click)="clockOut()"
      >
        {{ remoteActive && workMode === 'Remote' ? 'Remote Clock-Out' : 'Web Clock-Out' }}
      </ion-button>

      <!-- Clock Out Button - Remote -->
      <div class="row-center" *ngIf="remoteActive && isClockedIn && workMode === 'Remote' && currentUrl !== '/Me'">
        <ion-button
          class="btn-clockout remote-clockout"        
          (click)="remoteClockOut()">
          Remote Clock-Out
        </ion-button>
      </div>

      <ion-button
        class="btn-clockout me-clock-out remote-clockout"
        *ngIf="remoteActive && isClockedIn && workMode === 'Remote' && currentUrl == '/Me'"
        (click)="remoteClockOut()"
      >
        Remote Clock-Out
      </ion-button>

      <!-- Clock Out Button - WFH -->
      <div class="row-center" *ngIf="isClockedIn && workMode === 'WFH' && currentUrl !== '/Me'">
      <ion-button
        class="btn-clockout"        
        (click)="clockOut()">
        WFH Clock-Out
      </ion-button></div>

      <ion-button
        class="btn-clockout me-clock-out"
        *ngIf="isClockedIn && workMode === 'WFH' && currentUrl == '/Me'"
        (click)="clockOut()"
      >
        WFH Clock-Out
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
  workMode: string = 'Office'; // Track work mode: Office, WFH, Remote
  remoteActive = false; // Track if remote clock-in is active
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
        this.isClockedIn = isClockedIn;
        // Check persisted remoteActive flag
        this.remoteActive = localStorage.getItem('remoteActive') === 'true';
        // If remoteActive, force workMode to Remote
        if (this.remoteActive) {
          this.workMode = 'Remote';
        }
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
          this.workMode = 'Office';
          this.remoteActive = false;
          localStorage.removeItem('remoteActive');
          return;
        }
        const lastPunch = punches[punches.length - 1];
        this.isClockedIn = lastPunch.punch_type === 'in';
        this.workMode = lastPunch.work_mode || 'Office';
        // Save punches to localStorage for clock state subscription
        localStorage.setItem('todayPunches', JSON.stringify(punches));
        // If last punch is remote and clocked in, set remoteActive
        if (this.isClockedIn && this.workMode === 'Remote') {
          this.remoteActive = true;
          localStorage.setItem('remoteActive', 'true');
        } else {
          this.remoteActive = false;
          localStorage.removeItem('remoteActive');
        }
      },
      error: () => {
        this.isClockedIn = false;
        this.workMode = 'Office';
        this.remoteActive = false;
        localStorage.removeItem('remoteActive');
      }
    });
  }

  /* ================= CLOCK IN ================= */
  clockIn(): void {
    this.loading = true;
    // Determine work mode and location
    let work_mode = 'Office';
    let location = 'Mumbai Office';
    let notes = 'Morning shift';
    if (this.remoteActive || this.workMode === 'Remote') {
      work_mode = 'Remote';
      location = 'Remote';
      notes = 'Remote Clock-In';
    } else if (this.workMode === 'WFH') {
      work_mode = 'WFH';
      location = 'Home';
      notes = 'WFH Clock-In';
    }
    this.attendanceApi.apiPunchIn({
      work_mode,
      location,
      notes,
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

  /* =============== REMOTE CLOCK OUT =============== */
  remoteClockOut(): void {
    this.loading = true;
    this.attendanceApi.apiPunchOut({
      notes: 'Remote Clock-Out',
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.remoteActive = false;
          localStorage.removeItem('remoteActive');
          this.statusChanged.emit(res);
        }
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Remote Clock-Out failed');
      },
    });
  }
}
