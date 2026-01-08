import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { environment } from 'src/environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit, OnDestroy {

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

  private destroy$ = new Subject<void>();
  private profileImageCache = new Map<number, string>();

  constructor(
    private employeeService: EmployeeService,
    private routeGuardService: RouteGuardService,
    private router: Router
  ) { }

  ngOnInit() {
    this.subscribeToProfileImageUpdates();
    this.loadTeamData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================= PROFILE IMAGE SUBSCRIPTION ================= */

  subscribeToProfileImageUpdates() {
    this.employeeService.profileImageUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((imageUrl: string | null) => {
        if (imageUrl) {
          console.log('📸 My Team: Profile image update received:', imageUrl);
          // Refresh team data to get updated images
          if (this.showAttendance) {
            this.loadAttendanceData();
          } else {
            this.loadTeamData();
          }
        }
      });
  }

  /* ================= LOAD TEAM DATA ================= */

  loadTeamData() {
    this.loading = true;
    this.env = environment.apiURL.startsWith('http') ? environment.apiURL : `http://${environment.apiURL}`;

    // Get user role from RouteGuardService
    this.userRole = this.routeGuardService.userRole?.toLowerCase() || null;

    console.log('🔍 Loading Team Data - User Role:', this.userRole);

    // Use getMyTeamList for ALL roles - server handles manager vs employee logic
    this.employeeService.getMyTeamList().subscribe({
      next: (res: any) => {
        console.log('✅ My Team API Response:', res);
        
        // Handle different response formats
        if (res?.team) {
          this.teamMembers = res.team;
        } else if (Array.isArray(res)) {
          this.teamMembers = res;
        } else {
          this.teamMembers = [];
        }
        
        this.filteredMembers = [...this.teamMembers];
        console.log('✅ Team Members Count:', this.teamMembers.length);
        console.log('✅ Team Type:', res?.type || 'unknown');
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching team list:', err);
        console.error('❌ Error details:', err.error);
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
      // Use cached URL if available, otherwise construct with cache-buster
      const employeeId = member.id || member.employee_id;
      if (this.profileImageCache.has(employeeId)) {
        return this.profileImageCache.get(employeeId)!;
      }

      const imageUrl = `http://${environment.apiURL}${member.profile_image}?t=${Date.now()}`;
      this.profileImageCache.set(employeeId, imageUrl);
      return imageUrl;
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

  /* ================= NAVIGATE TO APPROVALS PAGES ================= */

  navigateToTimesheetApprovals() {
    this.router.navigate(['/ManagerTimesheetApprovals']);
  }

  navigateToLeaveApprovals() {
    this.router.navigate(['/ManagerLeaveApprovals']);
  }

  navigateToWfhApprovals() {
    this.router.navigate(['/ManagerWfhApprovals']);
  }
}
