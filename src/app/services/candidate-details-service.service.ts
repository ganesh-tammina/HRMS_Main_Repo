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
  JoiningDate: string;  // YYYY-MM-DD format
  OfferValidity: number; // in days (e.g. 7, 15)
}

@Injectable({
  providedIn: 'root'
})
export class CandidateDetailsService {
  private baseUrl = 'http://localhost:3562/candidates';
  private offerUrl = 'http://localhost:3562/offer-details';

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

  /** ⚠️ Handle all API errors */
  private handleError(error: HttpErrorResponse) {
    console.error('❌ API Error:', error);
    return throwError(() => new Error(error.message));
  }
}
