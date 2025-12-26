import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private EMPLOYEE_UPLOAD_URL = 'http://localhost:3000/api/upload/employees';
  private employeeUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // ✅ Upload employee excel file
  uploadEmployees(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.EMPLOYEE_UPLOAD_URL, formData);
  }


  // ================= NEW METHOD (ADD THIS ONLY) =================
  getAllEmployeeDeatils(): Observable<any[]> {
    return this.http.get<any[]>(`${this.employeeUrl}`);
  }
}
