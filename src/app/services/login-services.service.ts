import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private LOGIN_URL = 'http://localhost:3000/api/auth/login';
  private CHECK_EMAIL_URL = 'http://localhost:3000/api/auth/employee/check';
  private CREATE_USER_URL = 'http://localhost:3000/api/auth/user/create';

  constructor(private http: HttpClient) { }

  /** CHECK EMAIL */
  checkEmployee(email: string): Observable<any> {
    return this.http.get(`${this.CHECK_EMAIL_URL}?email=${email}`);
  }

  /** LOGIN */
  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.LOGIN_URL, payload).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  /** CREATE USER */
  createUser(email: string, password: string): Observable<any> {
    return this.http.post(this.CREATE_USER_URL, {
      email,
      password,
      role: 'employee'
    });
  }

  logout(): void {
    localStorage.clear();
  }
}
