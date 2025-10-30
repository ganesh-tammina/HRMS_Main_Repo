import { Request, Response } from "express";

export interface LeaveBalance {
  employee_id: number;
  leave_year_start: string;
  leave_year_end: string;
  casual_leave_allocated?: number;
  marriage_leave_allocated?: number;
  comp_offs_allocated?: number;
  sick_leave_allocated?: number;
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

export interface LeaveInfo {
  employee_id: number;
  employee_number: string;
  full_name: string;
  causal_leave_allocated: number;
  causal_leave_taken: number;
  marriage_leave_allocated: number;
  marriage_leave_taken: number;
  comp_offs_allocated: number;
  comp_offs_taken: number;
  sick_leave_allocated: number;
  sick_leave_taken: number;
  paid_leave_allocated: number;
  paid_leave_taken: number;
}
