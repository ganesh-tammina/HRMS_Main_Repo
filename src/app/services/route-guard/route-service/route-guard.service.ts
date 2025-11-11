import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class RouteGuardService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ROLE_KEY = 'role';
  private readonly EMPLOYEE_ID_KEY = 'employee_id';
  constructor(private http: HttpClient, private router: Router) {}
  storeTokens(
    accessToken: string,
    refreshToken: string | null,
    employee_id: string | null,
    role: string
  ): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.ROLE_KEY, role);
    localStorage.setItem(this.EMPLOYEE_ID_KEY, employee_id!);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  login(token: string, role: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    localStorage.setItem(this.ROLE_KEY, role);
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.EMPLOYEE_ID_KEY);
<<<<<<< HEAD
    localStorage.removeItem('login_time'); // Clear login time on logout
    
    // Clear all attendance records for all users
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('attendance_')) {
        localStorage.removeItem(key);
      }
    });
    
=======
>>>>>>> e6556074353d2537e20a7079a93357d2a92a9ff2
    this.router.navigate(['/']);
  }

  redirectBasedOnRole(role: string): void {
    switch (role.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'user':
        this.router.navigate(['/Home']);
        break;
      case 'hr':
        this.router.navigate(['/Home']);
        break;
      default:
        console.warn('Unknown role:', role);
        this.router.navigate(['/login']);
    }
  }

  get token(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get userRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  get employeeID(): string | null {
    return localStorage.getItem(this.EMPLOYEE_ID_KEY);
  }
}
