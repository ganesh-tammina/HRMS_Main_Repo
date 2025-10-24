import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CandidateService } from '../pre-onboarding.service';
import { AttendanceService, AttendanceRecord } from '../attendance.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-clock-button',
  styleUrls: ['clock-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div *ngIf="currentCandidate">
      <ion-button class="btn-clockin" (click)="clockIn()" *ngIf="!isClockedIn">
        Web Clock-In
      </ion-button>
      <ion-button class="btn-clockout" (click)="clockOut()" *ngIf="isClockedIn">
        Clock-Out
      </ion-button>
      <div *ngIf="isClockedIn" class="ms-2">
        Since Last Login : {{ timeSinceLastLogin }}
      </div>
    </div>
    <div *ngIf="!currentCandidate">
      <p>Please login to clock in/out.</p>
    </div>
  `,
})
export class ClockButtonComponent implements OnInit, OnDestroy {
  currentCandidate?: any;
  @Input() record?: AttendanceRecord;
  @Output() statusChanged = new EventEmitter<AttendanceRecord>();

  timeSinceLastLogin = '0h 0m 0s';
  private intervalSub?: Subscription;

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.candidateService.getEmpDet().subscribe((user: any) => {
      this.currentCandidate = user || undefined;

      // Restore record from localStorage if available
      const storedRecord = localStorage.getItem('attendanceRecord');
      if (storedRecord) {
        this.record = JSON.parse(storedRecord);
      }

      // Subscribe to service record updates
      if (this.currentCandidate && !this.record) {
        this.attendanceService.record$.subscribe((record) => {
          if (record && record.employeeId === this.currentCandidate?.id) {
            this.record = record;
            this.statusChanged.emit(record);
            localStorage.setItem('attendanceRecord', JSON.stringify(record));
          }
        });

        this.attendanceService.getRecord(this.currentCandidate.id);
      }

      // Timer updates
      this.intervalSub = interval(1000).subscribe(() => this.updateTimeSinceLogin());
    });
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  clockIn() {
    if (!this.currentCandidate) return;
    const record = this.attendanceService.clockIn(this.currentCandidate);
    this.record = record;
    this.statusChanged.emit(record);
    localStorage.setItem('attendanceRecord', JSON.stringify(record));
  }

  clockOut() {
    if (!this.currentCandidate) return;
    const record = this.attendanceService.clockOut(this.currentCandidate);
    this.record = record;
    this.statusChanged.emit(record);
    localStorage.setItem('attendanceRecord', JSON.stringify(record));
  }

  get isClockedIn(): boolean {
    return this.record?.isClockedIn || false;
  }

  private updateTimeSinceLogin() {
    if (!this.record || !this.record.isClockedIn || !this.record.clockInTime) {
      this.timeSinceLastLogin = '0h 0m 0s';
      return;
    }
    const now = new Date().getTime();
    const clockIn = new Date(this.record.clockInTime).getTime();
    const diff = now - clockIn;
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    this.timeSinceLastLogin = `${hours}h ${minutes}m ${seconds}s`;
  }
}
