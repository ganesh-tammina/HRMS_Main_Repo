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
  private baseURL = 'http://localhost:3562/api/v1/';
  private recordSubject = new BehaviorSubject<AttendanceRecord | null>(null);
  record$ = this.recordSubject.asObservable();
  constructor(private http: HttpClient) { }
  private getKey(employeeId: number): string {
    return `${this.prefix}${employeeId}`;
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


  employeeClockIN_Out(kjhk: any, ouyiuy: string): Observable<any> {
    return this.http.post(this.baseURL + ouyiuy, kjhk, { withCredentials: true });
  }
  clockIn(employeeId: any): AttendanceRecord {
    console.log(employeeId, "JDKJHDF")
    let record = this.getRecord(employeeId.data[0][0].employee_id);
    if (!record.isClockedIn) {
      const now = new Date().toISOString();
      this.employeeClockIN_Out({ employee_id: employeeId.data[0][0].employee_id, check_in: new Date().toTimeString().split(' ')[0] }, "clockin").subscribe(res => {
        alert(JSON.stringify(res));
      });
      record.clockInTime = now;
      record.isClockedIn = true;
      record.history.push({ type: 'CLOCK_IN', time: now });

      const today = new Date().toDateString();
      record.dailyAccumulatedMs ||= {};
      record.dailyAccumulatedMs[today] ||= 0;

      this.saveRecord(record);
    }
    return record;
  }

  clockOut(employeeId: any): AttendanceRecord {
    let record = this.getRecord(employeeId.data[0][0].employee_id);
    console.log(record, "RECORD")
    if (record.isClockedIn && record.clockInTime) {
      const now = new Date();
      const duration = now.getTime() - new Date(record.clockInTime).getTime();
      this.employeeClockIN_Out({ employee_id: employeeId.data[0][0].employee_id, check_out: new Date().toTimeString().split(' ')[0] }, "clockout").subscribe(res => {
        alert(JSON.stringify(res));
      });
      record.accumulatedMs += duration;

      const today = now.toDateString();
      record.dailyAccumulatedMs ||= {};
      record.dailyAccumulatedMs[today] ||= 0;
      record.dailyAccumulatedMs[today] += duration;

      record.isClockedIn = false;
      record.clockInTime = undefined;

      record.history.push({ type: 'CLOCK_OUT', time: now.toISOString() });

      this.saveRecord(record);
    }
    return record;
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
