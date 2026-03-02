import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class PayslipsComponent implements OnInit {
  // Attendance/Leave summary
  payableDays: number = 0;
  lopDays: number = 0;
  currentEmployee: any;

  // Salary values
  monthlySalary: number | null = null;

  basic!: number;
  hra!: number;
  medicalAllowance!: number;
  transportAllowance!: number;
  specialAllowance!: number;

  totalEarnings!: number;

  pfContribution!: number;
  pfEmployerContribution!: number;
  esiEmployeeAmount!: number;

  totalContributions!: number;

  professionalTax!: number;
  totalDeductions!: number;

  netSalary!: number;
  netSalaryInWords: string = '';

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe((emp: any) => {
      this.currentEmployee = emp;

      if (!emp?.lpa) return;

      // =============================
      // Monthly Salary (Dynamic)
      // =============================
      this.monthlySalary = Math.round((emp.lpa / 12) * 100) / 100;

      // =============================
      // Earnings
      // =============================
      this.basic = this.round(this.monthlySalary * 0.4);
      this.hra = this.round(this.basic * 0.4);

      this.medicalAllowance = 15000 / 12;   // yearly → monthly
      this.transportAllowance = 19200 / 12; // yearly → monthly

      // Calculate pfEmployerContribution and pfContribution (fixed 1800 if basic >= 15000)
      if (this.basic >= 15000) {
        this.pfContribution = 1800;
        this.pfEmployerContribution = 1800;
      } else {
        this.pfContribution = this.round(this.basic * 0.12);
        this.pfEmployerContribution = this.pfContribution;
      }

      // Add pfEmployerContribution and employer ESI (if applicable) to specialAllowance
      let employerESI = 0;
      if (this.monthlySalary < 25000) {
        employerESI = this.round(this.monthlySalary * 3.0 / 100);
      }
      this.specialAllowance = this.round(
        this.monthlySalary -
        (this.basic +
          this.hra +
          this.medicalAllowance +
          this.transportAllowance +
          this.pfEmployerContribution +
          employerESI
        )
      );

      this.totalEarnings = this.round(
        this.basic +
        this.hra +
        this.medicalAllowance +
        this.transportAllowance +
        this.specialAllowance
      );

      // =============================
      // Contributions (only employee side, employer side is now in special allowance)
      // =============================
      // pfContribution already calculated above

      this.esiEmployeeAmount =
        this.monthlySalary < 25000
          ? this.round(this.monthlySalary * 0.0070)
          : 0;

      this.totalContributions = this.round(
        this.pfContribution + this.esiEmployeeAmount
      );

      // =============================
      // Professional Tax
      // =============================
      if (this.monthlySalary < 15000) {
        this.professionalTax = 0;
      } else if (this.monthlySalary <= 20000) {
        this.professionalTax = 150;
      } else {
        this.professionalTax = 200;
      }

      this.totalDeductions = this.professionalTax;

      // =============================
      // Net Salary
      // =============================
      this.netSalary = this.round(
        this.totalEarnings -
        this.totalContributions -
        this.totalDeductions
      );

      this.netSalaryInWords = this.numberToWords(this.netSalary);
    });
  }

  // =============================
  // Helpers
  // =============================
  round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  get esiEmployee(): number {
    return this.esiEmployeeAmount || 0;
  }

  numberToWords(num: number): string {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
      'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero Rupees only';

    let words = '';
    let n = Math.floor(num);

    if (Math.floor(n / 1000) > 0) {
      words += a[Math.floor(n / 1000)] + ' Thousand ';
      n %= 1000;
    }

    if (Math.floor(n / 100) > 0) {
      words += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }

    if (n > 0) {
      if (n < 20) words += a[n];
      else words += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    }

    return words.trim() + ' Rupees only';
  }
}
