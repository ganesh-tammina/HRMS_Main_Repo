import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Project {
  id?: number;
  project_code: string;
  project_name: string;
  client_name: string;
  start_date: string;   // YYYY-MM-DD
  end_date: string;     // YYYY-MM-DD
  status: 'Active' | 'OnHold' | 'Completed';
  description?: string;
  project_manager_id: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private readonly BASE_URL = `http://${environment.apiURL}/api/projects`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token'); // 🔐 store token on login
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  /* ============================
     CREATE PROJECT
  ============================ */
  createProject(payload: Project): Observable<any> {
    return this.http.post(this.BASE_URL, payload, {
      headers: this.getHeaders()
    });
  }

  /* ============================
     GET ALL PROJECTS
  ============================ */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.BASE_URL, {
      headers: this.getHeaders()
    });
  }

  /* ============================
     FILTER BY STATUS (CLIENT SIDE)
  ============================ */
  filterByStatus(projects: Project[], status: string): Project[] {
    if (!status) return projects;
    return projects.filter(p => p.status === status);
  }
}
