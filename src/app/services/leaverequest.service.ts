import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MyLeave {
  id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_on: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaverequestService {

  private readonly API_URL = 'http://localhost:3000/api/leaves';

  constructor(private http: HttpClient) { }

  /** COMMON HEADERS */


  /* ================= APPLY LEAVE ================= */
  applyLeave(payload: {
    leave_type_id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }): Observable<any> {
    return this.http.post(
      `${this.API_URL}/apply`,
      payload,
    );
  }

  /* ================= GET MY LEAVES (CURL MATCH) =================
     GET /api/leaves/my-leaves?leave_year=2025
  */
  getMyLeaves(leaveYear: number): Observable<MyLeave[]> {
    const params = new HttpParams()
      .set('leave_year', leaveYear.toString());

    return this.http.get<MyLeave[]>(
      `${this.API_URL}/my-leaves`,
      { params }
    );
  }
}
