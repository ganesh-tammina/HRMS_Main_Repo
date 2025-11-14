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
      Web Clock-In
    </ion-button>
      <ion-button
        class="btn-clockout"
        *ngIf="(isClockedIn && (currentUrl!=='/Me'))"
        (click)="clockOut()"
      >
      Web Clock-Out
      </ion-button>

      <ion-button
        class="btn-clockout me-clock-out"
        *ngIf="(isClockedIn && (currentUrl=='/Me'))"
        (click)="clockOut()"
      >
      Web Clock-Out
      </ion-button>
      <div class="ms-2" *ngIf="(isClockedIn && (currentUrl=='/Me'))">
        Since Last Login :
        <strong>{{ timeSinceLastLogin }}</strong>
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

          // Timer will be initialized after attendance status is loaded
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

  private initializeTimer() {
    // Set initial time immediately
    this.updateTimeSinceLogin();
    
    // Then start the interval timer
    this.intervalSub = interval(1000).subscribe(() =>
      this.updateTimeSinceLogin()
    );
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  clockIn() {
    if (!this.currentCandidate) return;

    const empId = this.currentCandidate.data[0][0].employee_id;
    const now = new Date();
    
    // Start timer immediately
    this.record = {
      employeeId: empId,
      clockInTime: now.toISOString(),
      isClockedIn: true,
      accumulatedMs: 0,
      history: [{
        type: 'CLOCK_IN',
        time: now.toISOString(),
        displayTime: now.toLocaleTimeString()
      }],
      dailyAccumulatedMs: {}
    };
    this.attendanceService.saveRecord(this.record);
    this.statusChanged.emit(this.record);
    this.initializeTimer(); // Start timer immediately
    
    const clockInData = {
      LogType: 'IN',
      EmpID: empId
    };
    
    console.log('🔄 Sending clock-in data:', clockInData);
    
    this.attendanceService.clockInServer(clockInData).subscribe({
      next: (response) => {
        console.log('✅ Clock-in response:', response);
        if (!response.status) {
          // If server fails, revert the local state
          this.checkAttendanceStatus(empId);
        }
      },
      error: (err) => {
        console.error('❌ Clock-in failed - Full error:', err);
        console.error('❌ Error response body:', err.error);
        alert(err.error?.message || 'Clock-in failed');
        // Refresh status after error to sync with server
        this.checkAttendanceStatus(empId);
      }
    });
  }

  clockOut() {
    if (!this.currentCandidate || !this.record) return;

    const empId = this.currentCandidate.data[0][0].employee_id;
    const clockOutData = {
      LogType: 'OUT',
      EmpID: empId
    };
    
    console.log('🔄 Sending clock-out data:', clockOutData);
    
    this.attendanceService.clockOutServer(clockOutData).subscribe({
      next: (response) => {
        console.log('✅ Clock-out response:', response);
        if (response.status && this.record) {
          const now = new Date();
          const accumulatedMs = this.calculateAccumulatedMs();
          
          this.record = {
            employeeId: empId,
            isClockedIn: false,
            accumulatedMs: this.record.accumulatedMs + accumulatedMs,
            history: [...this.record.history, {
              type: 'CLOCK_OUT',
              time: now.toISOString(),
              displayTime: now.toLocaleTimeString()
            }],
            dailyAccumulatedMs: this.record.dailyAccumulatedMs || {}
          };
          
          this.attendanceService.saveRecord(this.record);
          this.statusChanged.emit(this.record);
          // Refresh status after successful operation
          this.checkAttendanceStatus(empId);
        }
      },
      error: (err) => {
        console.error('❌ Clock-out failed - Full error:', err);
        console.error('❌ Error response body:', err.error);
        alert(err.error?.message || 'Clock-out failed');
        // Refresh status after error to sync with server
        this.checkAttendanceStatus(empId);
      }
    });
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
    const clockInTime = new Date(this.record.clockInTime).getTime();
    const diff = Math.max(0, now - clockInTime); // Ensure non-negative

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.max(0, Math.floor(totalSeconds / 3600));
    const minutes = Math.max(0, Math.floor((totalSeconds % 3600) / 60));
    const seconds = Math.max(0, totalSeconds % 60);

    this.timeSinceLastLogin = `${hours}h ${minutes}m ${seconds}s`;
  }

  private calculateAccumulatedMs(): number {
    if (!this.record?.clockInTime) return 0;
    const clockIn = new Date(this.record.clockInTime).getTime();
    const now = new Date().getTime();
    return now - clockIn;
  }

  private checkAttendanceStatus(empId: number) {
    console.log('🔍 Checking attendance status for employee:', empId);
    
    // Use the actual attendance data to determine status
    const attendanceData = {
      employee_id: empId,
      date: new Date().toISOString().split('T')[0]
    };
    
    this.attendanceService.getallattendace(attendanceData).subscribe({
      next: (response: any) => {
        console.log('✅ Attendance data response:', response);
        
        const attendanceRecords = response.attendance || [];
        console.log('📅 Today attendance records:', attendanceRecords);
        
        // Check if there's an open session (clocked in but not clocked out)
        const hasOpenSession = attendanceRecords.some((record: any) => 
          record.check_in && !record.check_out
        );
        
        console.log('🎯 Has open session:', hasOpenSession);
        
        // Find the actual clock-in time from today's records
        let actualClockInTime: string | undefined;
        if (hasOpenSession) {
          const openRecord = attendanceRecords.find((record: any) => 
            record.check_in && !record.check_out
          );
          if (openRecord) {
            // Convert server time format to ISO string
            const today = new Date().toISOString().split('T')[0];
            actualClockInTime = `${today}T${openRecord.check_in}`;
          }
        }
        
        this.record = {
          employeeId: empId,
          isClockedIn: hasOpenSession,
          clockInTime: actualClockInTime,
          accumulatedMs: 0,
          history: [],
          dailyAccumulatedMs: {}
        };
        
        this.attendanceService.saveRecord(this.record);
        this.statusChanged.emit(this.record);
        
        // Initialize timer after record is set
        this.initializeTimer();
      },
      error: (err) => {
        console.error('❌ Error getting attendance data:', err);
        // Fallback to localStorage
        this.record = this.attendanceService.getRecord(empId);
        if (this.record) {
          this.statusChanged.emit(this.record);
          // Initialize timer after fallback record is set
          this.initializeTimer();
        }
      }
    });
  }

  private checkIfClockedIn(attendanceData: any[]): boolean {
    console.log('🔍 checkIfClockedIn - Data:', attendanceData);
    
    if (!attendanceData || attendanceData.length === 0) {
      console.log('⚠️ No attendance data found');
      return false;
    }
    
    // Get the last entry for today
    const lastEntry = attendanceData[attendanceData.length - 1];
    console.log('📅 Last entry:', lastEntry);
    
    const isClockedIn = lastEntry?.LogType === 'IN';
    console.log('🔄 Is clocked in result:', isClockedIn);
    
    return isClockedIn;
  }

  private getLastClockInTime(attendanceData: any[]): string | undefined {
    console.log('🕰️ getLastClockInTime - Data:', attendanceData);
    
    if (!attendanceData || attendanceData.length === 0) return undefined;
    
    // Find the last clock-in entry
    for (let i = attendanceData.length - 1; i >= 0; i--) {
      if (attendanceData[i].LogType === 'IN') {
        console.log('✅ Found last clock-in time:', attendanceData[i].LogTime);
        return attendanceData[i].LogTime;
      }
    }
    
    console.log('⚠️ No clock-in time found');
    return undefined;
  }


}