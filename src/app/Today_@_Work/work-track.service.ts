import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkTrackService {
  private environment = environment;
  private api = `https://${this.environment.apiURL}/api/v1/work-track`;

  constructor(private http: HttpClient) { }

  submitReport(data: any): Observable<any> {
    return this.http.post(`${this.api}/save`, data);
  }

  fetchReportsByDateRange(employee_id: number, startDate: string, endDate: string): Observable<any> {
    return this.http.post(`${this.api}/get-reports-by-date-range`, { employee_id, startDate, endDate });
  }
}
