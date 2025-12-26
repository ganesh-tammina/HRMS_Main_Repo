import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveInitializeService {

  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /* 🔹 Get all employees */
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
  }

  /* 🔹 Initialize leave balance */
  initializeForEmployee(
    employeeId: number,
    payload: { leave_plan_id: number; leave_year: number }
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/leaves/initialize-balance/${employeeId}`,
      payload
    );
  }
}
