export interface TT {
  employee_id: number;
  check_in: string;
}

export interface TO {
  employee_id: number;
  check_out: string;
}

export interface AttendanceRecordInput {
  employeeId: number;
  clockInTime?: string;
  accumulatedMs: number;
  isClockedIn: boolean;
}

export interface AttendanceEventInput {
  recordId: number;
  eventType: 'CLOCK_IN' | 'CLOCK_OUT';
  eventTime: string;
  displayTime?: string;
}

export interface DailyAccumulationInput {
  recordId: number;
  workDate: string;
  accumulatedMs: number;
}
