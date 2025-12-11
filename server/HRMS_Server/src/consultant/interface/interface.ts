export interface ConsultantTimesheet {
    id?: number;
    time_sheet_month: string;
    project_name: string;
    consultant_name: string;
    consultant_temp_id: string;
    manager_name: string;
    business_unit: string;
    location: string;
    start_date_of_consultant: string;

    day1?: string; day2?: string; day3?: string; day4?: string; day5?: string;
    day6?: string; day7?: string; day8?: string; day9?: string; day10?: string;
    day11?: string; day12?: string; day13?: string; day14?: string; day15?: string;
    day16?: string; day17?: string; day18?: string; day19?: string; day20?: string;
    day21?: string; day22?: string; day23?: string; day24?: string; day25?: string;
    day26?: string; day27?: string; day28?: string; day29?: string; day30?: string;
    day31?: string;

    days_worked?: number;
    leaves?: number;
    comp_offs?: number;
    holidays?: number;
    weekends?: number;
    total_pay?: number;
    remarks?: string;
    consultant_signature?: string;
    consultant_sign_date?: string;
    manager_signature?: string;
    manager_sign_date?: string;
}
