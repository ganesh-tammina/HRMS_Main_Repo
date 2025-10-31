import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class _LoginService {
  private api: string = 'https://30.0.0.78:3562/api';
  constructor(private http: HttpClient) { }

  public checkEmail(body: any) {
    return this.http.post<any>(`${this.api}/v1/check-email`, body, {
      withCredentials: true,
    });
  }
  public employeePasswordGeneration(body: any) {
    return this.http.post<any>(`${this.api}/v1/gen-password`, body, {
      withCredentials: true,
    });
  }
  public loginForAll(body: any) {
    return this.http.post<any>(`${this.api}/v1/login`, body, {
      withCredentials: true,
    });
  }
}
