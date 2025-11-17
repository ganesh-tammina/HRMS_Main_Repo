export interface WeekOffPolicy {
  week_off_policy_id?: number;     // optional for insert
  week_off_policy_name: string;
  week_off_days: string;           // e.g., "Saturday,Sunday"
}
