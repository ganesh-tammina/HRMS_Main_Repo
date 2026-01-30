import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FinanceServiceService } from '../finance-service.service';

@Component({
  selector: 'app-finance-admin',
  templateUrl: './finance-admin.component.html',
  styleUrls: ['./finance-admin.component.scss'],
  standalone: true,
  imports: [HttpClientModule]
})
export class FinanceAdminComponent implements OnInit {
  employeeDetails: any;
  loading = false;
  constructor(private financeService: FinanceServiceService) { }

  ngOnInit() {
    this.loadEmployeeDetails(724);
  }
  loadEmployeeDetails(employeeId: number): void {
    this.loading = true;

    this.financeService.getEmployeeDetails(employeeId).subscribe({
      next: (res) => {
        this.employeeDetails = res;
        console.log('Employee Details:', res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load employee details', err);
        this.loading = false;
      }
    });
  }
}
