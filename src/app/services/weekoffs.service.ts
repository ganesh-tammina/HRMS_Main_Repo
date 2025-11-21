import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { weekOff } from './pre-onboarding.service';
import { environment } from 'src/environments/environment';

export interface WeekOff {
  week_off_policy_name: string;
  week_off_days: string;
}
@Injectable({
  providedIn: 'root'
})

export class WeekoffService {

  private env = environment
  private baseUrl = `https://${this.env.apiURL}/api/v1/weekoff`;


  constructor(private http: HttpClient) { }

  createWeekoff(data: weekOff): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.baseUrl, data, {
      headers,
      withCredentials: true // MUST for cookie auth
    });
  }

  getWeekoffs(): Observable<any> {
    return this.http.get(this.baseUrl, { withCredentials: true });
  }

  updateWeekoff(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data, {
      withCredentials: true
    });
  }

  deleteWeekoff(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }
}
