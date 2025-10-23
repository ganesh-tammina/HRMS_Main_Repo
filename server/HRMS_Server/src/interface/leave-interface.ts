export interface LeaveBalance {
  employee_id: number;
  leave_year_start: string;
  leave_year_end: string;
  casual_leave_allocated?: number;
  marriage_leave_allocated?: number;
  comp_offs_allocated?: number;
  medical_leave_allocated?: number;
  paid_leave_allocated?: number;
}

export interface LeaveRequest {
  employee_id: number;
  leave_type: 'CASUAL' | 'MARRIAGE' | 'COMP_OFF' | 'MEDICAL' | 'PAID';
  start_date: string;
  end_date: string;
  total_days: number;
  remarks?: string;
}