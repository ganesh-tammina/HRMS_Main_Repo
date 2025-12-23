import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly API_URL = 'http://localhost:3000/api/employees';
  private readonly profileEndpoint = `${this.API_URL}/profile/me`;
  private currentEmployee: any | null = null;

  private currentEmployeeSubject = new BehaviorSubject<any>(null);
  currentEmployee$ = this.currentEmployeeSubject.asObservable();


  constructor(private http: HttpClient) { }

  getMyProfile(force = false): Observable<any> {
    if (this.currentEmployee && !force) {
      return of(this.currentEmployee);
    }

    const token = localStorage.getItem('token');
    return this.http
      .get<any>(`${this.API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(tap((emp) => (this.currentEmployee = emp)));
  }

  getCurrentEmployee() {
    return this.currentEmployee;
  }

  searchEmployees(keyword: string): Observable<any[]> {
    const params = new HttpParams().set('q', keyword);
    return this.http.get<any[]>(`${this.API_URL}/search/query`, { params });
  }
  clearEmployee(): void {
    this.currentEmployeeSubject.next(null);
  }
}
