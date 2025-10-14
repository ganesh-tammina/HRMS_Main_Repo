import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonButton } from '@ionic/angular';
import { CandidateService, Candidate } from '../pre-onboarding.service';
import { AttendanceService, AttendanceRecord, AttendanceEvent } from '../attendance.service';

@Component({
  selector: 'app-clock-button',  
  styleUrls: ['clock-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div *ngIf="currentCandidate" class="d-flex">
      <ion-button class="btn-clockin" (click)="clockIn()" *ngIf="!isClockedIn">
        Web Clock-In
      </ion-button>
      <ion-button class="btn-clockout" (click)="clockOut()" *ngIf="isClockedIn">
        Clock-Out
      </ion-button>      
    </div>
    <div *ngIf="!currentCandidate">
      <p>Please login to clock in/out.</p>
    </div>
  `,
})
export class ClockButtonComponent implements OnInit {
  currentCandidate?: Candidate;
  record?: AttendanceRecord;


  employee?: Candidate;

  breakMinutes: number = 60;
  effectiveHours: string = '0h 0m';
  grossHours: string = '0h 0m';
  timeSinceLastLogin: string = '0h 0m 0s';
  status: string = 'Absent';

  currentTime: string = '';
  currentDate: string = '';
  history: AttendanceEvent[] = [];
  selectedRange: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' = 'TODAY';
  progressValue: number = 0.85; // 85% completed for the day

  activeTab: string = 'log'; // default tab
  currentMonth: Date = new Date();
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  calendarDays: any[] = [];
  // activeTab: string = 'log';

  //  activeTab: string = 'log';

  // attendanceLogss: AttendanceLog[] = [];
  showPopover = false;

  // Optional event emitter to notify parent pages
  @Output() statusChanged = new EventEmitter<AttendanceRecord>();

  constructor(
    private candidateService: CandidateService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.candidateService.currentCandidate$.subscribe((user: any) => {
      this.currentCandidate = user || undefined;
      if (this.currentCandidate) {
        this.record = this.attendanceService.getRecord(this.currentCandidate.id);

      }
    });
  }
  formatHoursMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  formatHMS(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  updateTimes() {
    if (!this.record) return;
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour12: true });
    this.currentDate = now.toDateString();

    const today = this.currentDate;
    const dailyMs = this.record.dailyAccumulatedMs?.[today] || 0;

    // Total gross = all accumulated today + ongoing session
    let totalMs = dailyMs;
    let sessionMs = 0;
    if (this.record.isClockedIn && this.record.clockInTime) {
      sessionMs = now.getTime() - new Date(this.record.clockInTime).getTime();
      totalMs += sessionMs;
    }

    // Session timer since last login
    this.timeSinceLastLogin = this.formatHMS(sessionMs);

    // Gross hours today
    const grossMinutes = Math.floor(totalMs / 60000);
    this.grossHours = this.formatHoursMinutes(grossMinutes);

    const effectiveMinutes = Math.max(grossMinutes - this.breakMinutes, 0);
    this.effectiveHours = this.formatHoursMinutes(effectiveMinutes);

    // Status: Present if any accumulated hours today
    this.status = totalMs > 0 ? 'Present' : 'Absent';
  }

  loadHistory() {
    if (!this.record) return;
    const rawHistory = this.attendanceService.getHistoryByRange(this.record, this.selectedRange);
    this.history = rawHistory.map(event => ({
      ...event,
      displayTime: new Date(event.time).toLocaleTimeString('en-US', { hour12: true })
    }));
  }

  clockIn() {
    if (!this.currentCandidate) return;
    this.record = this.attendanceService.clockIn(this.currentCandidate.id);
    this.statusChanged.emit(this.record);
    this.updateTimes();
    this.loadHistory();
  }

  clockOut() {
    if (!this.currentCandidate) return;
    this.record = this.attendanceService.clockOut(this.currentCandidate.id);
    this.statusChanged.emit(this.record);
    this.updateTimes();
    this.loadHistory();
  }

  get isClockedIn(): boolean {
    return this.record?.isClockedIn || false;
  }
}
