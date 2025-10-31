import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Candidate {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Email: string;
  Gender: string;
  JobTitle: string;
  Department: string;
  JobLocation: string;
  WorkType: string;
  BusinessUnit: string;
}

export interface OfferDetails {
  Email: string;
  JoiningDate: string;  // YYYY-MM-DD
  OfferValidity: number; // days
}

export interface SalaryStructure {
  candidate_id: number;
  basic: number;
  hra: number;
  medical_allowance: number;
  transport_allowance: number;
  special_allowance: number;
  sub_total: number;
  pf_employer: number;
  total_annual: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateDetailsService {
  private baseUrl = 'http://30.0.0.78:3562/candidates';
  private offerUrl = 'http://30.0.0.78:3562/offer-details';
  private packageUrl = 'http://30.0.0.78:3562/salary-structure';

  constructor(private http: HttpClient) { }

  /** 🧍 Create new candidate */
  createCandidate(candidate: Candidate): Observable<any> {
    console.log('📤 Sending candidate data:', candidate);
    return this.http.post(this.baseUrl, candidate).pipe(
      catchError(this.handleError)
    );
  }

  /** 📋 Get all candidates */
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  /** 💼 Create offer details for candidate */
  createOfferDetails(offer: OfferDetails): Observable<any> {
    console.log('📤 Sending offer details:', offer);
    return this.http.post(this.offerUrl, offer).pipe(
      catchError(this.handleError)
    );
  }

  /** 💰 Create Salary Structure for candidate */
  createSalaryStructure(salary: SalaryStructure): Observable<any> {
    console.log('📤 Sending salary structure:', salary);
    return this.http.post(this.packageUrl, salary).pipe(
      catchError(this.handleError)
    );
  }
  /** 🔍 Get candidate by ID */
  getCandidateById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /** ⚠️ Handle all API errors */
  private handleError(error: HttpErrorResponse) {
    console.error('❌ API Error:', error);
    return throwError(() => new Error(error.message));
  }
}
