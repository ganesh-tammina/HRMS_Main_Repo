import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RouteGuardService } from './route-guard/route-service/route-guard.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private env = environment;
  private LOGIN_URL = `http://${this.env.apiURL}/api/auth/login`;
  private CHECK_EMAIL_URL = `http://${this.env.apiURL}/api/auth/employee/check`;
  private CREATE_USER_URL = `http://${this.env.apiURL}/api/auth/user/create`;

  constructor(
    private http: HttpClient,
    private routeGuardService: RouteGuardService
  ) { }

  /** CHECK EMAIL */
  checkEmployee(email: string): Observable<any> {
    return this.http.get(`${this.CHECK_EMAIL_URL}?email=${email}`);
  }

  /** LOGIN */
  login(payload: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.LOGIN_URL, payload).pipe(
      tap(res => {
        if (res?.token && res?.user) {
          // Store using RouteGuardService for consistency
          this.routeGuardService.storeTokens(
            res.token,           // accessToken
            res.token,           // refreshToken (using same token)
            res.user.id?.toString() || null,  // employee_id
            res.user.role || 'employee'       // role
          );

          // Also keep backward compatibility
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
    this.routeGuardService.logout();
  }
}