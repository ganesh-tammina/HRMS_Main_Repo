export interface WorkFromHome {
  employee_id: number;
  notified_user_id: number;
  from_date: string;
  from_session: string;
  to_date: string;
  to_session: string;
  reason: string;
  total_days: number;
  type:string
}
