import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService {

  private baseUrl = 'http://${this.env.apiURL}/api/timesheets';

  constructor(private http: HttpClient) { }

  /* ================= SUBMIT TIMESHEET ================= */

  submitRegularTimesheet(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/regular/submit`,
      payload
    );
  }

  /* ================= GET MY TIMESHEETS ================= */

  getMyRegularTimesheets(filters: {
    start_date?: string;
    end_date?: string;
    month?: number;
    year?: number;
  }): Observable<any> {

    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(
      `${this.baseUrl}/regular/my-timesheets`,
      { params }
    );
  }

  /* ================= DOWNLOAD EXCEL ================= */

  downloadTimesheetExcel(timesheetId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/regular/${timesheetId}/download`,
      {
        responseType: 'blob'
      }
    );
  }
}
