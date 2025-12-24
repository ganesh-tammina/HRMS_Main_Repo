import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeaverequestService {

  private readonly API_URL = 'http://localhost:3000/api/leaves';

  constructor(private http: HttpClient) {}

  /**
   * Apply Leave
   */
  applyLeave(payload: {
    leave_type_id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    });

    return this.http.post(
      `${this.API_URL}/apply`,
      payload,
      { headers }
    );
  }
}
