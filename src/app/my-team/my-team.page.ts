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
  
  // Attendance data
  selectedDate: string = new Date().toISOString().split('T')[0];
  attendanceData: any = null;
  attendanceSummary: any = null;
  showAttendance = false;
  attendanceFilter: string = 'all'; // all, present, absent, on_leave

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

  /* ================= LOAD ATTENDANCE DATA ================= */

  loadAttendanceData() {
    this.showAttendance = true;
    this.loading = true;

    this.employeeService.getTeamAttendanceReport(this.selectedDate).subscribe({
      next: (res: any) => {
        console.log('✅ Full Attendance Report Response:', res);
        
        const teamMembersData = res.team_members || [];
        this.attendanceData = res.attendance || [];
        this.attendanceSummary = res.summary || null;
        
        console.log('✅ Team Members Count:', teamMembersData.length);
        console.log('✅ Attendance Records Count:', this.attendanceData.length);
        console.log('✅ Summary:', this.attendanceSummary);
        
        // Merge team members with their attendance data
        this.teamMembers = teamMembersData.map((member: any) => {
          // Find attendance record for this member
          const attendanceRecord = this.attendanceData.find((att: any) => att.employee_id === member.id);
          
          return {
            id: member.id,
            EmployeeNumber: member.EmployeeNumber,
            FullName: `${member.FirstName} ${member.LastName}`,
            full_name: `${member.FirstName} ${member.LastName}`,
            FirstName: member.FirstName,
            LastName: member.LastName,
            WorkEmail: member.WorkEmail,
            work_email: member.WorkEmail,
            department: member.department,
            department_name: member.department_name,
            designation: member.designation,
            designation_name: member.designation_name,
            profile_image: member.profile_image,
            EmploymentStatus: member.EmploymentStatus,
            // Add attendance info
            attendance: attendanceRecord ? {
              status: attendanceRecord.status || 'present',
              attendance: {
                check_in: attendanceRecord.first_check_in,
                check_out: attendanceRecord.last_check_out,
                total_hours: attendanceRecord.gross_hours || attendanceRecord.total_work_hours,
                work_mode: attendanceRecord.work_mode,
                location: attendanceRecord.location,
                total_punches: attendanceRecord.total_punches
              }
            } : {
              status: 'absent',
              attendance: null
            }
          };
        });
        
        console.log('✅ Mapped Team Members:', this.teamMembers.length);
        console.log('✅ First mapped member:', this.teamMembers[0]);
        
        this.applyAttendanceFilter();
        console.log('✅ Filtered Members after filter:', this.filteredMembers.length);
        console.log('✅ Current filter:', this.attendanceFilter);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching attendance report:', err);
        this.loading = false;
      }
    });
  }

  /* ================= DATE CHANGE ================= */

  onDateChange(event: any) {
    this.selectedDate = event.detail.value.split('T')[0];
    this.loadAttendanceData();
  }

  /* ================= TOGGLE ATTENDANCE VIEW ================= */

  toggleAttendanceView() {
    if (!this.showAttendance) {
      this.loadAttendanceData();
    } else {
      this.showAttendance = false;
      this.attendanceFilter = 'all';
      // Reload original team members
      this.ngOnInit();
    }
  }

  /* ================= FILTER ATTENDANCE ================= */

  setAttendanceFilter(filter: string) {
    this.attendanceFilter = filter;
    this.applyAttendanceFilter();
  }

  applyAttendanceFilter() {
    if (this.attendanceFilter === 'all') {
      this.filteredMembers = [...this.teamMembers];
    } else {
      this.filteredMembers = this.teamMembers.filter((member: any) => {
        const status = this.getAttendanceStatus(member);
        return status === this.attendanceFilter;
      });
    }
  }

  /* ================= GET ATTENDANCE STATUS ================= */

  getAttendanceStatus(member: any): string {
    return member?.attendance?.status || 'absent';
  }

  getAttendanceBadgeColor(status: string): string {
    switch (status) {
      case 'present': return 'success';
      case 'on_leave': return 'warning';
      case 'absent': return 'danger';
      default: return 'medium';
    }
  }

  getAttendanceIcon(status: string): string {
    switch (status) {
      case 'present': return 'checkmark-circle';
      case 'on_leave': return 'calendar-outline';
      case 'absent': return 'close-circle';
      default: return 'help-circle';
    }
  }

  formatTime(time: string | null): string {
    if (!time) return '--:--';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatHours(hours: number | null): string {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
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
