import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LeaveService {
  private apiUrl = `https://${environment.apiURL}:3562/api`;

    constructor(private http: HttpClient) {}

    saveLeaves(leaveData: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/v1/leaves`, leaveData, {
        withCredentials: true,
      });
    }
}