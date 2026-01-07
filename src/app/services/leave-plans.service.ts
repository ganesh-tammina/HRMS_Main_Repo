import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LeavePlanService {

  private env = environment;
  private readonly API_URL = `http://${this.env.apiURL}/api/leaves/plans`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /* CREATE */
  createLeavePlan(payload: any): Observable<any> {
    return this.http.post(this.API_URL, payload, { headers: this.getHeaders() });
  }

  /* GET ALL */
  getLeavePlans(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL, { headers: this.getHeaders() });
  }

  /* GET BY ID (AS PER CURL) */
  getLeavePlanById(planId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${planId}`, {
      headers: this.getHeaders(),
    });
  }

  /* UPDATE */
  updateLeavePlan(planId: number, payload: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${planId}`, payload, {
      headers: this.getHeaders(),
    });
  }

  /* DELETE */
  deleteLeavePlan(planId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${planId}`, {
      headers: this.getHeaders(),
    });
  }
}
