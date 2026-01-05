import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {

  searchText = '';
  teamMembers: any[] = [];
  filteredMembers: any[] = [];
  loading = true;
  env: string = '';

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {

    // 🔹 Reporting employees (if employeeId exists)
    this.employeeService.employeeId$.subscribe((employeeId) => {
      if (!employeeId) return;

      this.loading = true;

      this.employeeService.getReportingEmployees(employeeId).subscribe({
        next: (res: any[]) => {
          this.teamMembers = res || [];
          this.filteredMembers = [...this.teamMembers];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });

    // 🔹 My Team list (API returns { type, team, message })
    this.employeeService.getMyTeamList().subscribe({
      next: (res: any) => {
        this.teamMembers = res?.team || [];
        this.filteredMembers = [...this.teamMembers];
        console.log('Team Members:', this.teamMembers);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
    this.env = environment.apiURL.startsWith('http') ? environment.apiURL : `http://${environment.apiURL}`;

  }

  /* ================= PROFILE IMAGE ================= */

  getProfileImage(member: any): string {
    if (member?.profile_image) {
      return `http://${environment.apiURL}${member.profile_image}`;
    }
    return 'assets/user.svg';
  }

  /* ================= SEARCH ================= */

  filterTeam() {
    const text = this.searchText.toLowerCase();

    this.filteredMembers = this.teamMembers.filter(m =>
      m.FullName?.toLowerCase().includes(text) ||
      m.WorkEmail?.toLowerCase().includes(text) ||
      m.department_name?.toLowerCase().includes(text)
    );
  }
}
