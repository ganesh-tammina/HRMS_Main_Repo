import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LeaveService {
  private apiUrl = 'http://localhost:3562/api';

    constructor(private http: HttpClient) {}

    saveLeaves(leaveData: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/v1/leaves`, leaveData, {
        withCredentials: true,
      });
    }
}