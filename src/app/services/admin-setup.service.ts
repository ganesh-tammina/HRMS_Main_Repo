import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminSetup {
    private env = environment;
  private baseUrl = `http://${this.env.apiURL}/api/auth/users`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  /** GET ALL USERS */
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, this.getHeaders());
  }

  /** MAKE HR */
  makeHR(userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${userId}/make-hr`,
      {},
      this.getHeaders()
    );
  }

  /** MAKE MANAGER */
  makeManager(userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${userId}/make-manager`,
      {},
      this.getHeaders()
    );
  }

  /** MAKE ADMIN */
  makeAdmin(userId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${userId}/make-admin`,
      {},
      this.getHeaders()
    );
  }
}
