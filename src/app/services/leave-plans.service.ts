import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeavePlanService {

  private readonly API_URL = 'http://${this.env.apiURL}/api/leaves/plans';

  constructor(private http: HttpClient) { }

  createLeavePlan(payload: any): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.API_URL, payload, { headers });
  }
  getLeavePlans(): Observable<any[]> {

    return this.http.get<any[]>(this.API_URL);
  }
}
