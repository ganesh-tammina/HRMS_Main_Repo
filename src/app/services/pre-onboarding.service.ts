import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { AttendanceService } from './attendance.service';

export interface Candidate {
  id: number;
  personalDetails: {
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    email: string;
    gender: string;
    profileImage?: string;
  };
  jobDetailsForm: {
    JobTitle: string;
    Department: string;
    JobLocation: string;
    WorkType: string;
    BusinessUnit: string;
  };
  employeeCredentials?: {
    companyEmail: string;
    password: string;
  };
  offerDetails?: {
    id?: number;
    DOJ?: string;
    offerValidity?: number;
    JoiningDate?: string;
  };
  packageDetails?: {
    annualSalary: number;
    basic?: number;
    hra?: number;
    medical?: number;
    transport?: number;
    special?: number;
    subtotal?: number;
    pfEmployer?: number;
    pfEmployee?: number;
    total?: number;
  };
  isAvailable?: boolean;
}

export interface Employee {
  employee_id: number;
  employee_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  work_email: string;
  gender: string;
  marital_status: string | null;
  blood_group: string | null;
  physically_handicapped: string | null;
  nationality: string | null;
  created_at: string;
  updated_at: string;
  attendance_number: string | null;
  location: string | null;
  location_country: string | null;
  legal_entity: string | null;
  business_unit: string | null;
  department: string | null;
  sub_department: string | null;
  job_title: string | null;
  secondary_job_title: string | null;
  reporting_to: string | null;
  reporting_manager_employee_number: string | null;
  dotted_line_manager: string | null;
  date_joined: string | null;
  leave_plan: string | null;
  band: string | null;
  pay_grade: string | null;
  time_type: string | null;
  worker_type: string | null;
  shift_policy_name: string | null;
  weekly_off_policy_name: string | null;
  attendance_time_tracking_policy: string | null;
  attendance_capture_scheme: string | null;
  holiday_list_name: string | null;
  expense_policy_name: string | null;
  notice_period: string | null;
  cost_center: string | null;

  // Address fields
  current_address_line1: string | null;
  current_address_line2: string | null;
  current_city: string | null;
  current_state: string | null;
  current_zip: string | null;
  current_country: string | null;
  permanent_address_line1: string | null;
  permanent_address_line2: string | null;
  permanent_city: string | null;
  permanent_state: string | null;
  permanent_zip: string | null;
  permanent_country: string | null;

  // Family details
  father_name: string | null;
  mother_name: string | null;
  spouse_name: string | null;
  children_names: string | null;

  // IDs and employment info
  pan_number: string | null;
  aadhaar_number: string | null;
  pf_number: string | null;
  uan_number: string | null;
  employment_status: string | null;
  exit_date: string | null;
  comments: string | null;
  exit_status: string | null;
  termination_type: string | null;
  termination_reason: string | null;
  resignation_note: string | null;
}

// Response structure
export interface EmployeeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Employee[][];
}

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private api = 'http://30.0.0.78:3562/';
  private apiUrl = `${this.api}candidates/jd`;
  private adminUrl = 'http://30.0.0.78:3562/1/admin';
  private offerUrl = `${this.api}candidates/offer-details`;
  private packageUrl = `${this.api}candidates/package-details`; // ✅ for package details
  private getapiUrl = `${this.api}candidates`;
  private getEmployees = `${this.api}employees`;
  private forgotpwd = `${this.api}forgot-pwd`;
  private newpassword = `${this.api}add-pwd`;
  private updatepassword = `${this.api}change-new-pwd`;
  private changeoldEmpwd = `${this.api}change-pwd`;
  private offerStatusapi = 'http://30.0.0.78:3562/offerstatus/status';
  private holidaysUrl = `${this.api}holidays/public_holidays`;
  private imagesUrl = `${this.api}uploads`;
  private empUrl = 'http://30.0.0.78:3562/api/v1/employee';

  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$ = this.candidatesSubject.asObservable();

  private currentCandidateSubject = new BehaviorSubject<Candidate | null>(
    this.getStoredCandidate()
  );
  currentCandidate$ = this.currentCandidateSubject.asObservable();

  private EmployeeSubject = new BehaviorSubject<Employee[]>([]);
  Employee$ = this.EmployeeSubject.asObservable();

  private currentEmployeeSubject = new BehaviorSubject<Employee | null>(
    this.getStoredEmployee()
  );
  currentEmployee$ = this.currentEmployeeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private attendanceService: AttendanceService
  ) {
    this.loadCandidates();
  }
  private getStoredEmployee(): Employee | null {
    const activeId = localStorage.getItem('activeEmployeeId');
    if (!activeId) return null;

    const stored = localStorage.getItem(`loggedInEmployee_${activeId}`);
    return stored ? JSON.parse(stored) : null;
  }
  private getStoredCandidate(): Candidate | null {
    const activeId = localStorage.getItem('activeUserId');
    if (!activeId) return null;

    const stored = localStorage.getItem(`loggedInCandidate_${activeId}`);
    return stored ? JSON.parse(stored) : null;
  }

  loadCandidates(): void {
    this.http.get<any>(this.getapiUrl).subscribe({
      next: (data: any) => {
        const candidates = this.normalizeCandidates(data);
        this.candidatesSubject.next(candidates);
      },
      error: (err: any) => console.error('Error loading candidates:', err),
    });
  }
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // POST to /upload route
    return this.http.post<{ imageUrl: string }>(`${this.imagesUrl}`, formData);
  }
  getCandidateById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getapiUrl}/${id}`);
  }

  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getEmployees}/${id}`);
  }

  getAdminById(id: string): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}`);
  }

  getHolidaysList(id: string): Observable<any> {
    return this.http.get<any>(`${this.holidaysUrl}`);
  }
  getofferStatus(): Observable<any> {
    return this.http.get<any>(this.offerStatusapi);
  }
  getImages(): Observable<any> {
    return this.http.get<any>(this.imagesUrl);
  }
  getEmpDet(): Observable<EmployeeResponse> {
    return this.http.post<any>(this.empUrl, {}, { withCredentials: true });
  }
  getAllEmployees(): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(this.empUrl).pipe();
  }

  private normalizeCandidates(data: any): Candidate[] {
    if (Array.isArray(data)) return data;
    if (data && data.candidates && Array.isArray(data.candidates))
      return data.candidates;
    if (data) return [data];
    return [];
  }

  createCandidate(candidateData: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.apiUrl, candidateData).pipe(
      tap((newCandidate) => {
        const current = this.candidatesSubject.value;
        this.candidatesSubject.next([...current, newCandidate]);
      })
    );
  }

  getotp(email: string): Observable<any> {
    return this.http.post(this.forgotpwd, { email });
  }

  newpasswordCreation(email: string): Observable<any> {
    return this.http.post(this.newpassword, { email });
  }

  changeoldEmpPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Observable<any> {
    const body = {
      email: email,
      otp: otp,
      newPassword: newPassword,
    };
    console.log(body);
    return this.http.post(this.changeoldEmpwd, body);
  }

  updateCandidate(candidate: Candidate): Observable<Candidate> {
    if (!candidate.offerDetails) {
      return throwError(
        () => new Error('offerDetails is missing in candidate')
      );
    }
    if (!candidate.offerDetails.DOJ) {
      return throwError(() => new Error('DOJ is missing in offerDetails'));
    }

    // Helper to parse DD/MM/YYYY → YYYY-MM-DD for MySQL DATE
    const formatDate = (dateStr: string | undefined): string | null => {
      if (!dateStr) return null;

      // If already in YYYY-MM-DD, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

      // Parse DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;

      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const formattedDOJ = formatDate(candidate.offerDetails.DOJ)!;
    const formattedJoiningDate = formatDate(candidate.offerDetails.JoiningDate);

    const offerPayload = {
      DOJ: formattedDOJ,
      offerValidity: candidate.offerDetails.offerValidity,
      JoiningDate: formattedJoiningDate,
    };

    // 🔹 FIRST TIME (no offerDetails.id) → POST
    if (!candidate.offerDetails.id) {
      const postBody = {
        candidateId: candidate.id,
        offerDetails: offerPayload,
      };

      return this.http.post<Candidate>(this.offerUrl, postBody).pipe(
        tap((created) => {
          // Ensure offerDetails exists
          if (!candidate.offerDetails) candidate.offerDetails = {};
          // Store backend id for future PUT
          if (created.offerDetails?.id)
            candidate.offerDetails.id = created.offerDetails.id;

          this.updateLocalCache(created);
        })
      );
    }

    // 🔹 NEXT TIME (already has id) → PUT
    const putBody = {
      id: candidate.id,
      ...offerPayload,
    };

    return this.http
      .put<Candidate>(`${this.offerUrl}/${candidate.id}`, putBody)
      .pipe(tap((updated) => this.updateLocalCache(updated)));
  }

  private updateLocalCache(candidate: Candidate) {
    const updatedList = this.candidatesSubject.value.map((c) =>
      c.id === candidate.id ? candidate : c
    );
    this.candidatesSubject.next(updatedList);

    if (this.currentCandidateSubject.value?.id === candidate.id) {
      this.currentCandidateSubject.next(candidate);
      localStorage.setItem(
        `loggedInCandidate_${candidate.id}`,
        JSON.stringify(candidate)
      );
    }
  }

  // ✅ New method for saving package details
  addPackageDetails(candidate: any): Observable<any> {
    if (!candidate.id) {
      return throwError(() => new Error('Candidate ID is required'));
    }
    if (!candidate.packageDetails || !candidate.packageDetails.annualSalary) {
      return throwError(
        () => new Error('packageDetails with annualSalary is required')
      );
    }

    const postBody = {
      candidateId: candidate.id,
      packageDetails: { ...candidate.packageDetails },
    };

    return this.http.post<any>(this.packageUrl, postBody).pipe(
      tap((res) => {
        console.log('Package details saved:', res);
      })
    );
  }
  createEmployee(Emp: any): Observable<any> {
    return this.http.post<any>(this.api + 'employees', Emp).pipe(
      tap((newCandidate) => {
        console.log(newCandidate);
      })
    );
  }
  createRejectedEmployee(Emp: any): Observable<any> {
    return this.http
      .post<any>('http://30.0.0.78:3562/employees/rejectedemployees', Emp)
      .pipe(
        tap((newCandidate) => {
          console.log(newCandidate);
        })
      );
  }
  findEmployee(email: string): Observable<Employee | undefined> {
    return this.http.get<Employee[]>(this.empUrl).pipe(
      map((employees) => employees.find((emp) => emp.work_email === email)),
      tap((found) => {
        if (found) {
          this.currentEmployeeSubject.next(found);
          localStorage.setItem(
            `loggedInEmployee_${found.employee_id}`,
            JSON.stringify(found)
          );
          localStorage.setItem(
            'activeEmployeeId',
            found.employee_id.toString()
          );
          this.attendanceService.getRecord(found.employee_id);
        }
      })
    );
  }

  verifyAndResetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Observable<any> {
    const body = { email, otp, newPassword };
    return this.http.post(this.updatepassword, body);
  }

  getCurrentCandidate(): Candidate | null {
    return this.currentCandidateSubject.value;
  }

  logout() {
    const activeId = localStorage.getItem('loggedInUser');
    if (activeId) {
      localStorage.removeItem(`loggedInUser_${activeId}`);
      localStorage.removeItem('activeUserId');
    }
    this.http.post<any>(this.api + 'api/v1/log-out', {}, { withCredentials: true }).subscribe();
    this.currentCandidateSubject.next(null);
  }

  searchCandidates(query: string): Candidate[] {
    const lowerQuery = query.toLowerCase().trim();
    return this.candidatesSubject.value.filter(
      (c) =>
        c.personalDetails.FirstName.toLowerCase().includes(lowerQuery) ||
        c.personalDetails.LastName.toLowerCase().includes(lowerQuery)
    );
  }
}
