import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})

export class LeaveService {
    private apiUrl = `https://${environment.apiURL}:3562/api`;

    constructor(private http: HttpClient) { }

    getLeaveRequests(employeeId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/get-leaves-requests`, { employeeId: employeeId }, { withCredentials: true });
    }

    getLeaveBalance(employeeId: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/get-leaves-balance`, { employeeId: employeeId}, { withCredentials: true });
    }

    requestLeave(leaveRequest: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/leave-request`, leaveRequest, { withCredentials: true });
    }

    cancelLeaveRequest(leaveId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/cancel-leave`, { leaveId: leaveId }, { withCredentials: true });
    }

}