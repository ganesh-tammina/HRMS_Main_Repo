import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RouteGuardService } from './route-guard/route-service/route-guard.service';

export interface AttendanceEvent {
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  time: string;
  displayTime?: string;
}

export interface AttendanceRecord {
  employeeId: number;
  clockInTime?: string;
  accumulatedMs: number;
  isClockedIn: boolean;
  history: AttendanceEvent[];
  dailyAccumulatedMs?: { [date: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private prefix = 'attendance_';
  private baseURL = `https://${environment.apiURL}/api/v1`;
  private recordSubject = new BehaviorSubject<AttendanceRecord | null>(null);
  record$ = this.recordSubject.asObservable();
  public responseSubject = new BehaviorSubject<any>(null);
  response$ = this.responseSubject.asObservable().pipe(
    debounceTime(50), // Small debounce to prevent rapid-fire updates
    distinctUntilChanged((prev, curr) => 
      prev?.action === curr?.action && prev?.optimistic === curr?.optimistic
    )
  );
  constructor(private http: HttpClient, private routeGuardService: RouteGuardService) { }
  private getKey(employeeId: number): string {
    return `${this.prefix}${employeeId}`;
  }


  getallattendace(body: any): Observable<any> {
    return this.http.post(this.baseURL + '/get-attendance', body, { withCredentials: true });
  }

  getRecord(employeeId: number): AttendanceRecord {
    const stored = localStorage.getItem(this.getKey(employeeId));
    let record: AttendanceRecord;

    if (stored) {
      record = JSON.parse(stored);
      record.history ||= [];
      record.accumulatedMs ||= 0;
      record.isClockedIn ??= false;
      record.dailyAccumulatedMs ||= {};
    } else {
      record = {
        employeeId,
        accumulatedMs: 0,
        isClockedIn: false,
        history: [],
        dailyAccumulatedMs: {}
      };
      this.saveRecord(record);
    }

    this.recordSubject.next(record);
    return record;
  }

  saveRecord(record: AttendanceRecord) {
    localStorage.setItem(this.getKey(record.employeeId), JSON.stringify(record));
    this.recordSubject.next(record);
  }


  employeeClockIN_Out(kjhk: any): Observable<any> {
    return this.http.post(this.baseURL + "/attendance", kjhk, { withCredentials: true });
  }
  getAttendance() {
    this.http.get(this.baseURL + 'getAttendance', { withCredentials: true }).subscribe((res) => {
      console.log(res)
    });
  }
  clockIn(employeeId: any): void {
    // Immediate local state update
    this.syncAttendanceState(employeeId, 'in');
    this.clockAction(employeeId, 'in');
  }

  clockOut(employeeId: any): void {
    // Immediate local state update
    this.syncAttendanceState(employeeId, 'out');
    this.clockAction(employeeId, 'out');
  }
  clockAction(employeeId: any, action: 'in' | 'out'): void {
    // Immediately emit optimistic update
    this.responseSubject.next({ action, optimistic: true });
    
    this.employeeClockIN_Out(employeeId).subscribe({
      next: (res) => {
        console.log(`${action.toUpperCase()} response`, res);
        
        // Immediate refresh after successful server response
        setTimeout(() => {
          this.refreshAttendanceStatus(employeeId);
        }, 100);
        
        // Emit confirmed response
        this.responseSubject.next({ action, data: res, confirmed: true });
      },
      error: (err) => {
        console.error(`Error during clock ${action}:`, err);
        this.responseSubject.next({ action, error: err });
      }
    });
  }




  checkServerAttendanceStatus(employeeId: number): Observable<any> {
    const body = {
      access_token: this.routeGuardService.token,
      refresh_token: this.routeGuardService.refreshToken,
      employee_id: employeeId
    };
    return this.http.post(this.baseURL + '/check-attendance-status', body, { withCredentials: true });
  }

  // Immediate data refresh with multiple attempts
  refreshAttendanceStatus(employeeId: number): void {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Try multiple times with short intervals for immediate response
    const attemptRefresh = (attempt: number = 1) => {
      this.getallattendace({
        employee_id: employeeId,
        date: currentDate
      }).subscribe({
        next: (data) => {
          if (data && data.attendance && data.attendance.length > 0) {
            const records = data.attendance;
            const record = this.getRecord(employeeId);
            
            // Find the most recent record
            const latestRecord = records[records.length - 1];
            
            // Update local record with fresh server data
            record.isClockedIn = latestRecord.check_in && !latestRecord.check_out;
            
            if (record.isClockedIn && latestRecord.check_in) {
              record.clockInTime = currentDate + 'T' + latestRecord.check_in;
            } else {
              record.clockInTime = undefined;
            }
            
            // Update history with all today's records
            record.history = records.map((r: any) => {
              const events = [];
              if (r.check_in) {
                events.push({
                  type: 'CLOCK_IN' as const,
                  time: currentDate + 'T' + r.check_in,
                  displayTime: new Date(currentDate + 'T' + r.check_in).toLocaleTimeString()
                });
              }
              if (r.check_out) {
                events.push({
                  type: 'CLOCK_OUT' as const,
                  time: currentDate + 'T' + r.check_out,
                  displayTime: new Date(currentDate + 'T' + r.check_out).toLocaleTimeString()
                });
              }
              return events;
            }).flat();
            
            this.saveRecord(record);
            console.log('✅ Attendance status refreshed successfully');
          } else if (attempt < 3) {
            // Retry if no data found and we haven't tried 3 times yet
            setTimeout(() => attemptRefresh(attempt + 1), 200);
          }
        },
        error: (err) => {
          console.error('Error refreshing attendance status:', err);
          if (attempt < 3) {
            setTimeout(() => attemptRefresh(attempt + 1), 300);
          }
        }
      });
    };
    
    attemptRefresh();
  }

  // Utility method to sync local state with server immediately
  syncAttendanceState(employeeId: number, action: 'in' | 'out'): void {
    const record = this.getRecord(employeeId);
    const now = new Date();
    
    if (action === 'in') {
      record.isClockedIn = true;
      record.clockInTime = now.toISOString();
      record.history.push({
        type: 'CLOCK_IN',
        time: now.toISOString(),
        displayTime: now.toLocaleTimeString()
      });
    } else {
      record.isClockedIn = false;
      record.clockInTime = undefined;
      record.history.push({
        type: 'CLOCK_OUT',
        time: now.toISOString(),
        displayTime: now.toLocaleTimeString()
      });
    }
    
    this.saveRecord(record);
  }

  clockInServer(employeeData: any): Observable<any> {
    return this.http.post(this.baseURL + '/attendance', employeeData, { withCredentials: true });
  }

  clockOutServer(employeeData: any): Observable<any> {
    return this.http.post(this.baseURL + '/attendance', employeeData, { withCredentials: true });
  }

  getHistoryByRange(
    record: AttendanceRecord,
    range: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  ): AttendanceEvent[] {
    const history = record.history || [];
    const now = new Date();

    return history.filter(event => {
      const eventDate = new Date(event.time);
      switch (range) {
        case 'TODAY':
          return eventDate.toDateString() === now.toDateString();
        case 'WEEK': {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return eventDate >= weekStart && eventDate <= now;
        }
        case 'MONTH':
          return (
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    });
  }
}
