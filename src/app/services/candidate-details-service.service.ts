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

@Injectable({
  providedIn: 'root'
})
export class CandidateDetailsService {
  private baseUrl = 'http://localhost:3562/candidates';

  constructor(private http: HttpClient) { }

  /** Create new candidate */
  createCandidate(candidate: Candidate): Observable<any> {
    console.log('📤 Sending candidate data:', candidate);
    return this.http.post(this.baseUrl, candidate).pipe(
      catchError(this.handleError)
    );
  }

  /** Get all candidates */
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ API Error:', error);
    return throwError(() => new Error(error.message));
  }
}
