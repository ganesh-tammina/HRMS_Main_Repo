import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';

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

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.employeeService.employeeId$.subscribe((employeeId) => {
      if (!employeeId) return;

      this.loading = true;

      this.employeeService.getReportingEmployees(employeeId).subscribe({
        next: (res) => {
          this.teamMembers = res || [];
          this.filteredMembers = [...this.teamMembers];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });
  }

  filterTeam() {
    const text = this.searchText.toLowerCase();

    this.filteredMembers = this.teamMembers.filter(m =>
      m.name?.toLowerCase().includes(text) ||
      m.email?.toLowerCase().includes(text) ||
      m.department?.toLowerCase().includes(text)
    );
  }

  getAvatar(member: any) {
    return member.avatar || 'assets/avatar-placeholder.png';
  }
}
