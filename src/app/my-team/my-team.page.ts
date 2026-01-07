import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
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
  userRole: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private routeGuardService: RouteGuardService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.env = environment.apiURL.startsWith('http') ? environment.apiURL : `http://${environment.apiURL}`;

    // Get user role from RouteGuardService
    this.userRole = this.routeGuardService.userRole?.toLowerCase() || null;

    // Check if user is a manager or higher (admin, hr, manager)
    const isManager = ['admin', 'hr', 'manager'].includes(this.userRole || '');

    console.log('🔍 User Role:', this.userRole);
    console.log('🔍 Is Manager:', isManager);

    if (isManager) {
      // 🔹 MANAGER ONLY: Get reporting employees
      const employeeId = this.routeGuardService.employeeID;
      console.log('🔹 Manager Employee ID:', employeeId);

      if (!employeeId) {
        console.error('❌ No employee ID found for manager');
        this.loading = false;
        return;
      }

      console.log('📞 Calling getReportingEmployees for manager');
      this.employeeService.getReportingEmployees(Number(employeeId)).subscribe({
        next: (res: any[]) => {
          console.log('✅ Manager API Response:', res);
          this.teamMembers = res || [];
          this.filteredMembers = [...this.teamMembers];
          console.log('✅ Manager - Reporting Employees Count:', this.teamMembers.length);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error fetching reporting employees:', err);
          this.loading = false;
        }
      });
      return; // ⚠️ CRITICAL: Exit here to prevent else block
    }
    
    // 🔹 EMPLOYEE ONLY: Get team list
    console.log('📞 Calling getMyTeamList for employee');
    this.employeeService.getMyTeamList().subscribe({
      next: (res: any) => {
        console.log('✅ Employee API Response:', res);
        this.teamMembers = res?.team || res || [];
        this.filteredMembers = [...this.teamMembers];
        console.log('✅ Employee - Team Members Count:', this.teamMembers.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching team list:', err);
        this.loading = false;
      }
    });
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
