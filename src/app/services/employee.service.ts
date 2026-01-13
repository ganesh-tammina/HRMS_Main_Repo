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

  private readonly myTeamEndpoint = `${this.API_URL}/my-team/list`;
  private readonly ATTENDANCE_API_URL = `http://${this.env.apiURL}/api/attendance`;

  private currentEmployee: any | null = null;

  private currentEmployeeSubject = new BehaviorSubject<any>(null);
  currentEmployee$ = this.currentEmployeeSubject.asObservable();

  // Profile image update subject
  private profileImageUpdateSubject = new BehaviorSubject<string | null>(null);
  profileImageUpdate$ = this.profileImageUpdateSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Update employee profile fields (HR only)
   * @param employeeId The employee's ID
   * @param updateData The fields to update
   */
  updateEmployeeProfile(
    employeeId: number,
    updateData: {
      reporting_manager_id?: number;
      leave_plan_id?: number;
      shift_policy_id?: number;
      attendance_policy_id?: number;
      PayGradeId?: number | null;
    }
  ): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return this.http.put(
      `${this.API_URL}/${employeeId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }

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

    return this.http.post(this.uploadProfileImageUrl, formData, { headers }).pipe(
      tap((res: any) => {
        // Broadcast the new profile image URL
        if (res.imagePath) {
          const imageUrl = `http://${this.env.apiURL}${res.imagePath}?t=${Date.now()}`;
          this.profileImageUpdateSubject.next(imageUrl);
          console.log('📸 Profile image updated and broadcasted:', imageUrl);
        }
      })
    );
  }

  getCurrentEmployee() {
    return this.currentEmployee;
  }

  searchEmployees(keyword: string): Observable<any[]> {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const params = new HttpParams().set('q', keyword);
    return this.http.get<any[]>(`${this.API_URL}/search/query`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  }


  /* Get all employees */
  getAllEmployees(): Observable<any[]> {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return this.http.get<any[]>(this.API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
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

  /* ================= ✅ NEW METHOD: MY TEAM LIST ================= */

  /**
   * Get logged-in employee's team members
   */
  getMyTeamList(): Observable<any[]> {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(this.myTeamEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  /* ================= ✅ TEAM ATTENDANCE REPORT ================= */

  /**
   * Get team attendance report for a specific date
   * @param date Date in YYYY-MM-DD format (optional, defaults to today)
   */
  getTeamAttendanceReport(date?: string): Observable<any> {
    const token = localStorage.getItem('token');
    let params = new HttpParams();

    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<any>(
      `${this.ATTENDANCE_API_URL}/report/team`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}
