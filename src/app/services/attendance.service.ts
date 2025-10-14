import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  // 🔑 make it reactive
  private recordSubject = new BehaviorSubject<AttendanceRecord | null>(null);
  record$ = this.recordSubject.asObservable();

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

    // ✅ emit current state
    this.recordSubject.next(record);
    return record;
  }

  saveRecord(record: AttendanceRecord) {
    localStorage.setItem(this.getKey(record.employeeId), JSON.stringify(record));
    this.recordSubject.next(record); // ✅ notify subscribers
  }

  clockIn(employeeId: number): AttendanceRecord {
    let record = this.getRecord(employeeId);
    if (!record.isClockedIn) {
      const now = new Date().toISOString();
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

  clockOut(employeeId: number): AttendanceRecord {
    let record = this.getRecord(employeeId);
    if (record.isClockedIn && record.clockInTime) {
      const now = new Date();
      const duration = now.getTime() - new Date(record.clockInTime).getTime();

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
