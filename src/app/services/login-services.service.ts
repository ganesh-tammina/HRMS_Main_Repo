import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn?: number;
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly LOGIN_URL = 'http://localhost:3000/api/auth/login';

  constructor(private http: HttpClient) { }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, payload).pipe(
      tap((res) => {
        console.log('Login response:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
