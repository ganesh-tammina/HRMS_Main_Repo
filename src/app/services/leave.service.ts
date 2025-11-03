import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class LeaveService {
    private baseUrl = "https://localhost:3562/api/v1"; // backend base URL

    constructor(private http: HttpClient) { }

    // ✅ Save or Add leave details (this matches your backend endpoint)
    saveLeaves(leaves: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/add-leaves-all`, leaves, {
            withCredentials: true,
        });
    }

    // ✅ (Optional) Get all leaves for a specific employee
    getLeaves(employeeId: number): Observable<any> {
        return this.http.post<any>(
            `${this.baseUrl}/get-leaves`,
            { employeeId },
        );
    }

    // ✅ (Optional) Submit a new leave request
    requestLeave(leaveRequest: any): Observable<any> {
        return this.http.post<any>(
            `${this.baseUrl}/leave-request`,
            leaveRequest,
        );
    }
}
