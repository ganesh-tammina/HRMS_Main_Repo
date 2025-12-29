import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService {

  private API_URL = 'http://localhost:3000/api/leaves/types';

  constructor(private http: HttpClient) { }

  createLeaveType(payload: any): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.API_URL, payload, { headers });
  }
  getLeaveTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}
