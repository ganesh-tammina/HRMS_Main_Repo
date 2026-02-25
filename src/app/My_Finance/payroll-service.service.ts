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

  getPayrollTempletes(): Observable<any> {
    return this.http.get(
      `${this.payrollUrl}templates`,
      { headers: this.getHeaders() }
    )
  }

  // 📄 Get Single Template Details
  // Endpoint: /api/payroll-master/templates/{templateId}
  getTemplateById(templateId: number): Observable<any> {
    return this.http.get(
      `${this.payrollUrl}templates/${templateId}`,
      { headers: this.getHeaders() }
    );
  }

  // 📄 Get Template Composition (All components belonging to a specific template)
  // Endpoint: /api/payroll-master/components/{templateId}
  getTemplateComposition(templateId: number): Observable<any> {
    return this.http.get(
      `${this.payrollUrl}templates/${templateId}/composition`,
      { headers: this.getHeaders() }
    );
  }
  getPayrollstructures(): Observable<any> {
    return this.http.get(
      `${this.payrollUrl}structures`,
      { headers: this.getHeaders() }
    );
  }
}
