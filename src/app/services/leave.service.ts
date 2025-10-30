import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root", 
})

export class LeaveService {
    private apiUrl = "http://localhost:3562/api"; 

    constructor(private http: HttpClient) {}

    getLeaves(employeeId: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/v1/get-leaves`, { employeeId } , { withCredentials: true });
    }
}