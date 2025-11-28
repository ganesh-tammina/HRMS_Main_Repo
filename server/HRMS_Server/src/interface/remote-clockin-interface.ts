export interface RemoteClockIn {
    employee_id: number;
    date: string;
    reason: string;
    clock_in : string;
    clock_out : string;
    notify: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
}
