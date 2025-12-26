import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {

  private readonly API_URL = 'http://localhost:3000/api/employees';
  private readonly profileEndpoint = `${this.API_URL}/profile/me`;

  /* ✅ NEW ENDPOINT */
  private readonly reportingEndpoint = `${this.API_URL}/reporting`;

  private currentEmployee: any | null = null;

  private currentEmployeeSubject = new BehaviorSubject<any>(null);
  currentEmployee$ = this.currentEmployeeSubject.asObservable();

  constructor(private http: HttpClient) { }

  /* ================= EXISTING CODE (UNCHANGED) ================= */

  getMyProfile(force = false): Observable<any> {
    if (this.currentEmployee && !force) {
      return of(this.currentEmployee);
    }

    const token = localStorage.getItem('token');
    return this.http
      .get<any>(this.profileEndpoint, {
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

  /* ================= ✅ NEW METHOD ================= */

  /**
   * Get reporting employees under a manager
   * @param employeeId Manager / Reporting ID
   */
  getReportingEmployees(employeeId: number): Observable<any[]> {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(
      `${this.reportingEndpoint}/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  private employeeIdSubject = new BehaviorSubject<number | null>(null);
  employeeId$ = this.employeeIdSubject.asObservable();

  setEmployeeId(id: number) {
    this.employeeIdSubject.next(id);
  }

  getEmployeeId(): number | null {
    return this.employeeIdSubject.value;
  }
}
