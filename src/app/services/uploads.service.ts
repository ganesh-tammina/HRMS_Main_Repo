import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private readonly apiUrl = 'http://localhost:3000/api/upload/employees';

  constructor(private http: HttpClient) { }

  /**
   * Upload Employee Master Excel File
   * @param file Excel file (.xlsx)
   */
  uploadEmployeeMaster(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    // IMPORTANT:
    // ❌ Do NOT set Content-Type manually for multipart
    // ✔ Browser will handle boundary
    const request = new HttpRequest(
      'POST',
      this.apiUrl,
      formData,
      {
        reportProgress: true,
        responseType: 'json'
      }
    );

    return this.http.request(request);
  }
}
