import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EmployeeService } from 'src/app/services/employee.service';
import { PayrollService } from '../payroll-service.service';

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

  earnings: any[] = [];
  deductions: any[] = [];
  salaryStructure: any = null;

  constructor(
    private employeeService: EmployeeService,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe((emp: any) => {
      this.currentEmployee = emp;
      if (!emp?.id) return;

      this.payrollService.getPayrollstructures().subscribe((res: any) => {
        const allStructures = Array.isArray(res) ? res : (res.data || []);
        const activeStructure = allStructures.find((s: any) => s.employee_id === emp.id && s.is_active);

        if (activeStructure) {
          this.payrollService.getPayrollStructureById(activeStructure.id).subscribe((details: any) => {
            const structure = details.structure || details;
            const components = details.components || details.salary_components || [];
            this.calculateStructureSalary(structure, components);
          });
        }
      });
    });
  }

  calculateStructureSalary(structure: any, components: any[]) {
    this.salaryStructure = structure;
    const ctc = Number(structure.ctc_amount);
    this.monthlySalary = ctc / 12;

    const calculatedAmts: any = { 'CTC': ctc };
    const sortedComps = [...components].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    // Pass 1: Handle FIXED values and PERCENTAGE OF CTC
    sortedComps.forEach(c => {
      if (c.calculation_type === 'FIXED') {
        calculatedAmts[c.code] = Number(c.value) || 0;
      } else if (c.calculation_type === 'PERCENTAGE' && (c.percentage_of_code === 'CTC' || !c.percentage_of_code)) {
        calculatedAmts[c.code] = (ctc * (Number(c.value) || 0)) / 100;
      }
    });

    // Pass 2: Handle PERCENTAGE OF other components
    sortedComps.forEach(c => {
      if (c.calculation_type === 'PERCENTAGE' && c.percentage_of_code && c.percentage_of_code !== 'CTC') {
        const baseAmt = calculatedAmts[c.percentage_of_code] || 0;
        calculatedAmts[c.code] = (baseAmt * (Number(c.value) || 0)) / 100;
      }
    });

    // Pass 3: Handle ESI Employer Formula: (CTC - Employer PF) * 3.25 / 103.25
    sortedComps.forEach(c => {
      const code = (c.code || '').toUpperCase();
      const name = (c.name || '').toUpperCase();
      const isESIEmployer = code.includes('ESI') &&
        (code.includes('EMPLOYER') || code.includes('EMPLOYOR') || code.includes('ER') ||
          name.includes('EMPLOYER') || name.includes('EMPLOYOR') || name.includes('ER'));

      if (isESIEmployer) {
        let pfm = 0;
        Object.keys(calculatedAmts).forEach(k => {
          const keyUpper = k.toUpperCase();
          if (keyUpper.includes('PF') &&
            (keyUpper.includes('EMPLOYER') || keyUpper.includes('EMPLOYOR') || keyUpper.includes('ER'))) {
            pfm = calculatedAmts[k];
          }
        });
        calculatedAmts[c.code] = (ctc - pfm) * (3.25 / 103.25);
      }
    });

    // Pass 4: Handle ESI Employee Formula: (Gross - Employer PF - ESI Employer) * 0.75 / 100
    sortedComps.forEach(c => {
      const code = (c.code || '').toUpperCase();
      const name = (c.name || '').toUpperCase();
      const isESIEmployee = code.includes('ESI') &&
        (code.includes('EMPLOYEE') || code.includes('EE') || name.includes('EMPLOYEE') || name.includes('EE')) &&
        !code.includes('EMPLOYER') && !code.includes('ER');
      if (isESIEmployee) {
        let pfm = 0;
        let esier = 0;
        Object.keys(calculatedAmts).forEach(k => {
          const keyUpper = k.toUpperCase();
          if (keyUpper.includes('PF') && (keyUpper.includes('EMPLOYER') || keyUpper.includes('ER'))) {
            pfm = calculatedAmts[k];
          }
          if (keyUpper.includes('ESI') && (keyUpper.includes('EMPLOYER') || keyUpper.includes('ER'))) {
            esier = calculatedAmts[k];
          }
        });
        calculatedAmts[c.code] = (ctc - pfm - esier) * (0.75 / 100);
      }
    });

    // Pass 5: Special Allowance (Balancing)
    const specialAllowanceComp = sortedComps.find(c =>
      c.code?.toUpperCase().includes('SPECIAL') && c.code?.toUpperCase().includes('ALLOWANCE') ||
      c.name?.toUpperCase().includes('SPECIAL') && c.name?.toUpperCase().includes('ALLOWANCE')
    );

    if (specialAllowanceComp) {
      let sumOfOthers = 0;
      sortedComps.forEach(c => {
        if (c === specialAllowanceComp) return;
        sumOfOthers += calculatedAmts[c.code] || 0;
      });
      calculatedAmts[specialAllowanceComp.code] = Math.max(0, ctc - sumOfOthers);
    }

    // Populate Earnings and Deductions for UI
    this.earnings = [];
    this.deductions = [];
    this.totalEarnings = 0;
    this.totalDeductions = 0;

    sortedComps.forEach(c => {
      const monthlyAmt = (calculatedAmts[c.code] || 0) / 12;
      const compObj = { name: c.name, actual: monthlyAmt, paid: monthlyAmt };

      if (c.component_type?.toUpperCase() === 'EARNING') {
        this.earnings.push(compObj);
        this.totalEarnings += monthlyAmt;
      } else {
        this.deductions.push(compObj);
        this.totalDeductions += monthlyAmt;
      }
    });

    this.netSalary = this.totalEarnings - this.totalDeductions;
    this.netSalaryInWords = this.numberToWords(this.netSalary);
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
