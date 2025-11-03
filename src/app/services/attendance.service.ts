import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private baseURL = 'https://localhost:3562/api/v1';
  private recordSubject = new BehaviorSubject<AttendanceRecord | null>(null);
  record$ = this.recordSubject.asObservable();
  private responseSubject = new BehaviorSubject<any>(null);
  response$ = this.responseSubject.asObservable();
  constructor(private http: HttpClient) { }
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
    this.clockAction(employeeId, 'in');
  }

  clockOut(employeeId: any): void {
    this.clockAction(employeeId, 'out');
  }
  clockAction(employeeId: any, action: 'in' | 'out'): void {
    this.employeeClockIN_Out(employeeId).subscribe({
      next: (res) => {
        console.log(`${action.toUpperCase()} response`, res);
        // Emit response so other components can listen
        this.responseSubject.next({ action, data: res });
      },
      error: (err) => {
        console.error(`Error during clock ${action}:`, err);
        this.responseSubject.next({ action, error: err });
      }
    });
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
