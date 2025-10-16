import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { tap, map, switchMap, concatMap, toArray } from 'rxjs/operators';
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
    BussinessUnit: string;
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

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private api = "http://30.0.0.78:3562/";
  private apiUrl = `${this.api}candidates/jd`;
  private adminUrl = "http://30.0.0.78:3562/1/admin";
  private offerUrl = `${this.api}candidates/offer-details`;
  private packageUrl = `${this.api}candidates/package-details`;   // ✅ for package details
  private getapiUrl = `${this.api}candidates`;
  private getEmployees = `${this.api}employees`;
  private forgotpwd = `${this.api}forgot-pwd`;
  private newpassword = `${this.api}add-pwd`;
  private updatepassword = `${this.api}change-new-pwd`;
  private changeoldEmpwd = `${this.api}change-pwd`;
  private offerStatusapi = "http://30.0.0.78:3562/offerstatus/status";
  private holidaysUrl = `${this.api}holidays/public_holidays`;
  private excelallemployees = "http://localhost:3562/api/v1/parse-excel"
  private bulkEmployees = "http://localhost:3562/api/v1/bulk-data-entry";


  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$ = this.candidatesSubject.asObservable();

  private currentCandidateSubject = new BehaviorSubject<Candidate | null>(this.getStoredCandidate());
  currentCandidate$ = this.currentCandidateSubject.asObservable();

  constructor(private http: HttpClient, private attendanceService: AttendanceService) {
    this.loadCandidates();
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
      error: (err: any) => console.error('Error loading candidates:', err)
    });
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

  postcurrentEmployees(currentEmployees: any): Observable<any> {
    console.log(currentEmployees);
    return this.http.post<any>(this.excelallemployees, currentEmployees);
  }

  postEmployeesInBatches(allEmployees: any[]): Observable<any[]> {
    const batchSize = 20; // smaller batch to avoid payload issues
    const batches = [];

    for (let i = 0; i < allEmployees.length; i += batchSize) {
      batches.push(allEmployees.slice(i, i + batchSize));
    }

    console.log(`Uploading ${batches.length} batches of ${batchSize} employees each...`);

    return from(batches).pipe(
      concatMap((batch, index) => {
        console.log(batch)
        console.log(`🚀 Sending batch ${index + 1}/${batches.length}`);
        return this.http.post<any>(this.bulkEmployees, batch);
      }),
      toArray() // collect all responses when done
    );
  }


  private normalizeCandidates(data: any): Candidate[] {
    if (Array.isArray(data)) return data;
    if (data && data.candidates && Array.isArray(data.candidates)) return data.candidates;
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


  changeoldEmpPassword(email: string, otp: string, newPassword: string): Observable<any> {
    const body = {
      email: email,
      otp: otp,
      newPassword: newPassword
    };
    console.log(body);
    return this.http.post(this.changeoldEmpwd, body);
  }


  updateCandidate(candidate: Candidate): Observable<Candidate> {
    if (!candidate.offerDetails) {
      return throwError(() => new Error('offerDetails is missing in candidate'));
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
      JoiningDate: formattedJoiningDate
    };

    // 🔹 FIRST TIME (no offerDetails.id) → POST
    if (!candidate.offerDetails.id) {
      const postBody = {
        candidateId: candidate.id,
        offerDetails: offerPayload
      };

      return this.http.post<Candidate>(this.offerUrl, postBody).pipe(
        tap((created) => {
          // Ensure offerDetails exists
          if (!candidate.offerDetails) candidate.offerDetails = {};
          // Store backend id for future PUT
          if (created.offerDetails?.id) candidate.offerDetails.id = created.offerDetails.id;

          this.updateLocalCache(created);
        })
      );
    }

    // 🔹 NEXT TIME (already has id) → PUT
    const putBody = {
      id: candidate.id,
      ...offerPayload
    };

    return this.http.put<Candidate>(`${this.offerUrl}/${candidate.id}`, putBody).pipe(
      tap((updated) => this.updateLocalCache(updated))
    );
  }

  private updateLocalCache(candidate: Candidate) {
    const updatedList = this.candidatesSubject.value.map(c => c.id === candidate.id ? candidate : c);
    this.candidatesSubject.next(updatedList);

    if (this.currentCandidateSubject.value?.id === candidate.id) {
      this.currentCandidateSubject.next(candidate);
      localStorage.setItem(`loggedInCandidate_${candidate.id}`, JSON.stringify(candidate));
    }
  }

  // ✅ New method for saving package details
  addPackageDetails(candidate: any): Observable<any> {
    if (!candidate.id) {
      return throwError(() => new Error('Candidate ID is required'));
    }
    if (!candidate.packageDetails || !candidate.packageDetails.annualSalary) {
      return throwError(() => new Error('packageDetails with annualSalary is required'));
    }

    const postBody = {
      candidateId: candidate.id,
      packageDetails: { ...candidate.packageDetails }
    };

    return this.http.post<any>(this.packageUrl, postBody).pipe(
      tap((res) => {
        console.log('Package details saved:', res);
      })
    );
  }
  createEmployee(Emp: any): Observable<any> {
    return this.http.post<any>(this.api + "employees", Emp).pipe(
      tap((newCandidate) => {
        console.log(newCandidate)
      })
    );
  }
  createRejectedEmployee(Emp: any): Observable<any> {
    return this.http.post<any>("http://localhost:3562/employees/rejectedemployees", Emp).pipe(
      tap((newCandidate) => {
        console.log(newCandidate)
      })
    );
  }
  findEmployee(email: string, password: string): Observable<Candidate | undefined> {
    return this.http.get<any>(this.getEmployees).pipe(
      map(data => {
        const candidates = this.normalizeCandidates(data);
        return candidates.find(c =>
          c.employeeCredentials?.companyEmail === email &&
          c.employeeCredentials?.password === password
        );
      }),
      tap(found => {
        if (found) {
          this.currentCandidateSubject.next(found);
          localStorage.setItem(`loggedInCandidate_${found.id}`, JSON.stringify(found));
          localStorage.setItem('activeUserId', found.id.toString());
          this.attendanceService.getRecord(found.id);
        }
      })
    );
  }

  verifyAndResetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    const body = { email, otp, newPassword };
    return this.http.post(this.updatepassword, body);
  }

  getCurrentCandidate(): Candidate | null {
    return this.currentCandidateSubject.value;
  }


  logout() {
    const activeId = localStorage.getItem('activeUserId');
    if (activeId) {
      localStorage.removeItem(`loggedInCandidate_${activeId}`);
      localStorage.removeItem('activeUserId');
    }
    this.currentCandidateSubject.next(null);
  }

  searchCandidates(query: string): Candidate[] {
    const lowerQuery = query.toLowerCase().trim();
    return this.candidatesSubject.value.filter(c =>
      c.personalDetails.FirstName.toLowerCase().includes(lowerQuery) ||
      c.personalDetails.LastName.toLowerCase().includes(lowerQuery)
    );
  }



}

