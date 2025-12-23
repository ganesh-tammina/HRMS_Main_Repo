import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceApiService {
  private readonly BASE_URL = 'http://localhost:3000/api/attendance';

  constructor(private http: HttpClient) { }

  /** ✅ PUNCH IN */
  apiPunchIn(payload: {
    work_mode: string;
    location: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/punch-in`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /** ✅ PUNCH OUT */
  apiPunchOut(payload: {
    notes?: string;
  }): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/punch-out`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /* ======================
 * 📊 MONTHLY REPORT
 * ====================== */
  getMonthlyReport(params: {
    startDate: string; // format: YYYY-MM-D
    endDate: string;   // format: YYYY-MM-DD
    month: number;     // 1-12
    year: number;      // YYYY
  }): Observable<any> {

    const httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate)
      .set('month', params.month.toString())
      .set('year', params.year.toString());

    return this.http.get(
      `${this.BASE_URL}/my-report`,
      {
        headers: this.getHeaders(),
        params: httpParams,
      }
    );
  }
  /** 📅 TODAY ATTENDANCE (NEW – AS PER CURL) */
  getTodayAttendance(): Observable<any> {
    return this.http.get(
      `${this.BASE_URL}/today`,
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
}
