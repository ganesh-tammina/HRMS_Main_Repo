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
  private CREATE_PASSWORD_URL = `http://${this.env.apiURL}/api/auth/password/create`;
  private PREVIEW_ROLE_URL = `http://${this.env.apiURL}/api/auth/user/preview-role`;
  private LOGOUT_URL = `http://${this.env.apiURL}/api/auth/logout`;

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

  /** CREATE PASSWORD (Forgot Password) */
  createPassword(employee_id: string, password: string, token: string): Observable<any> {
    return this.http.post(this.CREATE_PASSWORD_URL, {
      employee_id,
      password
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': '*/*'
      }
    });
  }

  /** PREVIEW ROLE - Check if employee has team/reporting members */
  previewRole(email: string): Observable<any> {
    return this.http.get(`${this.PREVIEW_ROLE_URL}/${email}`);
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('token');

    return this.http.post<any>(this.LOGOUT_URL,
      {}, // empty body like curl -d ''
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    ).pipe(
      tap(() => {
        // Clear storage after successful logout
        this.routeGuardService.logout();
      })
    );
  }

}