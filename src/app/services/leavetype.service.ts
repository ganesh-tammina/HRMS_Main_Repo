import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService {
private env = environment;
  private API_URL = `http://${this.env.apiURL}/api/leaves/types`;

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
