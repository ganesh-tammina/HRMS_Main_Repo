
import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CandidateService } from '../pre-onboarding.service';
import { AttendanceService, AttendanceRecord } from '../attendance.service';
import { Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';
import { RouteGuardService } from '../route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-clock-button',
  styleUrls: ['clock-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div *ngIf="currentCandidate" class="ion-text-left">
    
      <ion-button class="btn-clockin"
        *ngIf="(!isClockedIn && (currentUrl!=='/Me'))"
        (click)="clockIn()"
      >
        Web Clock-In
      </ion-button>
      <ion-button fill="clear" class="clear" *ngIf="(!isClockedIn && (currentUrl=='/Me'))" (click)="clockIn()">
      <img src="../../assets/Icons/attendance-icons/Web clockin.svg" width="16" height="16">
      web Clock_In
    </ion-button>
      <ion-button
        class="btn-clockout"
        *ngIf="isClockedIn"
        (click)="clockOut()"
      >
      Web Clock-Out
      </ion-button>

      <div class="ms-2" *ngIf="(isClockedIn && (currentUrl=='/Me'))">
        Since Last Login :
        <strong>{{ timeSinceLastLogin }}</strong>
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
  currentUrl: any;
  timeSinceLastLogin = '0h 0m 0s';
  private intervalSub?: Subscription;

  constructor(
    private router: Router,
    private candidateService: CandidateService,
    private attendanceService: AttendanceService,
    private routeGaurdService: RouteGuardService
  ) {



  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    console.log('Current Page URL:', this.currentUrl);
    
    // Check if user is logged in
    if (this.routeGaurdService.token && this.routeGaurdService.refreshToken) {
      this.candidateService.getEmpDet().subscribe({
        next: (user: any) => {
          this.currentCandidate = user || undefined;
          console.log('Current Candidate in ClockButton:', this.currentCandidate);

          if (this.currentCandidate && this.currentCandidate.data && this.currentCandidate.data[0]) {
            const empId = this.currentCandidate.data[0][0].employee_id;
            
            // Always check server for current attendance status on page load
            this.checkAttendanceStatus(empId);
            
            // Subscribe to attendance updates
            this.attendanceService.record$.subscribe((record) => {
              if (record && record.employeeId === empId) {
                this.record = record;
                this.statusChanged.emit(record);
              }
            });
          }

          // Timer for time since login
          this.intervalSub = interval(1000).subscribe(() =>
            this.updateTimeSinceLogin()
          );
        },
        error: (err) => {
          console.error('Error getting employee details:', err);
          // Set default state if can't get employee data
          this.record = {
            employeeId: 0,
            isClockedIn: false,
            accumulatedMs: 0,
            history: [],
            dailyAccumulatedMs: {}
          };
        }
      });
    } else {
      console.log('No valid tokens found');
    }
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  clockIn() {
    if (!this.currentCandidate) return;

    const empId = this.currentCandidate.data[0][0].employee_id;
    
    // Send clock-in to server with proper format
    const clockInData = {
      access_token: this.routeGaurdService.token,
      refresh_token: this.routeGaurdService.refreshToken,
      EmpID: empId,
      LogType: 'IN'
    };
    
    this.attendanceService.clockIn(clockInData);
    
    // Update local state immediately
    this.record = {
      employeeId: empId,
      clockInTime: new Date().toISOString(),
      isClockedIn: true,
      accumulatedMs: 0,
      history: [],
      dailyAccumulatedMs: {}
    };
    
    this.statusChanged.emit(this.record);
  }

  clockOut() {
    if (!this.currentCandidate) return;

    const empId = this.currentCandidate.data[0][0].employee_id;
    
    // Send clock-out to server with proper format
    const clockOutData = {
      access_token: this.routeGaurdService.token,
      refresh_token: this.routeGaurdService.refreshToken,
      EmpID: empId,
      LogType: 'OUT'
    };
    
    this.attendanceService.clockOut(clockOutData);
    
    // Update local state immediately
    this.record = {
      employeeId: empId,
      isClockedIn: false,
      accumulatedMs: this.calculateAccumulatedMs(),
      history: [],
      dailyAccumulatedMs: {}
    };
    
    this.statusChanged.emit(this.record);
  }

  get isClockedIn(): boolean {
    return this.record?.isClockedIn || false;
  }

  private updateTimeSinceLogin() {
    if (!this.record?.isClockedIn || !this.record.clockInTime) {
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

  private calculateAccumulatedMs(): number {
    if (!this.record?.clockInTime) return 0;
    const clockIn = new Date(this.record.clockInTime).getTime();
    const now = new Date().getTime();
    return now - clockIn;
  }

  private checkAttendanceStatus(empId: number) {
    console.log('Checking attendance status for employee:', empId);
    
    // Get today's attendance from server
    const today = new Date().toISOString().split('T')[0];
    const body = {
      access_token: this.routeGaurdService.token,
      refresh_token: this.routeGaurdService.refreshToken,
      employee_id: empId,
      date: today
    };
    
    this.attendanceService.getallattendace(body).subscribe({
      next: (response: any) => {
        console.log('Attendance status from server:', response);
        
        // Check if user is currently clocked in based on server data
        const isClockedIn = this.checkIfClockedIn(response.data || []);
        const clockInTime = isClockedIn ? this.getLastClockInTime(response.data || []) : undefined;
        
        console.log('Is clocked in:', isClockedIn, 'Clock in time:', clockInTime);
        
        this.record = {
          employeeId: empId,
          isClockedIn: isClockedIn,
          clockInTime: clockInTime,
          accumulatedMs: 0,
          history: [],
          dailyAccumulatedMs: {}
        };
        
        this.statusChanged.emit(this.record);
      },
      error: (err) => {
        console.error('Error getting attendance status:', err);
        // Default to not clocked in on error
        this.record = {
          employeeId: empId,
          isClockedIn: false,
          accumulatedMs: 0,
          history: [],
          dailyAccumulatedMs: {}
        };
        this.statusChanged.emit(this.record);
      }
    });
  }

  private checkIfClockedIn(attendanceData: any[]): boolean {
    if (!attendanceData || attendanceData.length === 0) return false;
    
    // Get the last entry for today
    const lastEntry = attendanceData[attendanceData.length - 1];
    return lastEntry?.LogType === 'IN';
  }

  private getLastClockInTime(attendanceData: any[]): string | undefined {
    if (!attendanceData || attendanceData.length === 0) return undefined;
    
    // Find the last clock-in entry
    for (let i = attendanceData.length - 1; i >= 0; i--) {
      if (attendanceData[i].LogType === 'IN') {
        return attendanceData[i].LogTime;
      }
    }
    return undefined;
  }


}
