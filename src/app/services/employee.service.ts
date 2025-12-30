import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private env = environment;
  private readonly API_URL = `http://${this.env.apiURL}/api/employees`;
  //  private readonly API_URL = 'http://localhost:3000/api/employees';
  private readonly profileEndpoint = `${this.API_URL}/profile/me`;
  /* ✅ NEW ENDPOINT */
  private readonly reportingEndpoint = `${this.API_URL}/reporting`;
  private readonly uploadProfileImageUrl = `${this.API_URL}/profile/image`;

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

  /* ================= UPLOAD PROFILE IMAGE ================= */
  uploadProfileImage(file: File): Observable<any> {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('image', file); // ⚠️ key must match backend (usually "image" or "file")

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT set Content-Type for FormData
    });

    return this.http.post(this.uploadProfileImageUrl, formData, { headers });
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
  setCurrentEmployeeId(id: number) {
    this.currentEmployeeSubject.next(id);
  }

  getEmployeeId(): number | null {
    return this.employeeIdSubject.value;
  }
  getCurrentEmployeeId(): number | null {
    return this.currentEmployeeSubject.value;
  }
}
