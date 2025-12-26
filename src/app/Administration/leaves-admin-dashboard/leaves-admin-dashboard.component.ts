import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaves-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './leaves-admin-dashboard.component.html',
  styleUrls: ['./leaves-admin-dashboard.component.scss'],
})
export class LeavesAdminDashboardComponent {

  /* 🔒 STATIC COUNTS */
  totalLeaveTypes = 6;
  totalLeavePlans = 2;
  totalEmployees = 120;

  constructor(private router: Router) { }

  goTo(path: string) {
    console.log(path);
    this.router.navigate([path]);
  }
}
