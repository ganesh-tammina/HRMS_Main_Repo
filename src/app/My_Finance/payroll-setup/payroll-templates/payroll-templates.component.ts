import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../payroll-service.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-templates',
  templateUrl: './payroll-templates.component.html',
  styleUrls: ['./payroll-templates.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PayrollTemplatesComponent implements OnInit {
  templates: any[] = [];

  constructor(
    private payrollService: PayrollService,
    private router: Router
  ) { }

  ngOnInit() {
    this.payrollService.getPayrollTempletes().subscribe((res: any) => {
      this.templates = Array.isArray(res) ? res : (res.data || []);
      console.log(this.templates);
    });
  }

  viewComposition(templateId: number) {
    this.router.navigate(['/template-composition', templateId]);
  }
  goBack() {
    this.router.navigate(['/masterpayroll']);
  }
}
