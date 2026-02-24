import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private payrollUrl = `http://${environment.apiURL}/api/payroll-master/`;

  constructor(private http: HttpClient) { }

  // 🔐 Get Authorization Headers
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Store token after login
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ POST - Set Default Payroll
  setDefaultPayroll(): Observable<any> {
    return this.http.post(
      `${this.payrollUrl}setup/defaults`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ❌ DELETE - Clear Payroll Setup
  clearPayrollSetup(): Observable<any> {
    return this.http.delete(
      `${this.payrollUrl}setup/clear`,
      { headers: this.getHeaders() }
    );
  }

  getPayrollComponents() {
    return this.http.get(
      `${this.payrollUrl}components`,
      { headers: this.getHeaders() }
    );
  }

  getPayrollTempletes() {
    return this.http.get(
      `${this.payrollUrl}templates`,
      { headers: this.getHeaders() }
    )
  }
}
