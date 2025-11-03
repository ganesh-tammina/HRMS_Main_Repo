import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class _LoginService {
  private api: string = environment.apiURL;
  constructor(private http: HttpClient) {}

  public checkEmail(body: any) {
    return this.http.post<any>(`${this.api}check-email`, body, {
      withCredentials: true,
    });
  }
  public employeePasswordGeneration(body: any) {
    return this.http.post<any>(`${this.api}gen-password`, body, {
      withCredentials: true,
    });
  }
  public loginForAll(body: any) {
    return this.http.post<any>(`${this.api}login`, body, {
      withCredentials: true,
    });
  }
}
