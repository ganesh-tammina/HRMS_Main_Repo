import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IonicModule } from '@ionic/angular';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipsComponent implements OnInit {
  // Salary breakdown fields
  basic: number | null = null;
  hra: number | null = null;
  medicalAllowance: number = 15000;
  transportAllowance: number = 19200;
  specialAllowance: number | null = null;
  totalEarnings: number | null = null;
  pfContribution: number | null = null;
  professionalTax: number = 200;
  totalContributions: number | null = null;
  totalDeductions: number = 200;
  netSalary: number | null = null;
  currentEmployee: any;
  one: any;
  full_name: string = ""
  currentTime: string = '';
  allEmployees: any[] = [];
  fullName: any;
  currentemp: any;
  employee_id: any;
  uploadedImageUrl: string | null = null;
  imageUrls: any;
  payslip: any = {}
  completepayroll: any = {}
  monthlySalary: number | null = null;
  constructor(private candidateService: CandidateService, private EmployeeService: EmployeeService) { }

  ngOnInit() {
    this.EmployeeService.getMyProfile().subscribe((data: any) => {
      this.currentEmployee = data;
      if (data.lpa) {
        this.monthlySalary = Math.round((data.lpa / 12) * 100) / 100;
        // Calculate salary breakdown
        this.basic = Math.round(this.monthlySalary * 0.4 * 100) / 100;
        this.hra = Math.round(this.monthlySalary * 0.16 * 100) / 100;
        this.medicalAllowance = 15000 / 12; // monthly value
        this.transportAllowance = 19200 / 12; // monthly value
        // Special Allowance = remainder
        this.specialAllowance = Math.round((this.monthlySalary - (this.basic + this.hra + this.medicalAllowance + this.transportAllowance)) * 100) / 100;
        // Total Earnings (A)
        this.totalEarnings = Math.round((this.basic + this.hra + this.medicalAllowance + this.transportAllowance + this.specialAllowance) * 100) / 100;
        // PF Contribution (B)
        if (this.monthlySalary >= 15000) {
          this.pfContribution = 1800;
        } else {
          this.pfContribution = Math.round(this.basic * 0.12 * 100) / 100;
        }
        this.totalContributions = this.pfContribution;
        // Professional Tax (C)
        this.totalDeductions = this.professionalTax;
        // Net Salary (A - B - C)
        this.netSalary = Math.round((this.totalEarnings - this.totalContributions - this.totalDeductions) * 100) / 100;
      } else {
        this.monthlySalary = null;
        this.basic = null;
        this.hra = null;
        this.specialAllowance = null;
        this.totalEarnings = null;
        this.pfContribution = null;
        this.totalContributions = null;
        this.netSalary = null;
      }
    });
  }
}
