import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.component.html',
  styleUrls: ['./payroll-setup.component.scss'],
  standalone: true,
})
export class PayrollSetupComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }

  payrollCompoents() {
    this.router.navigate(['/payroll-components']);
  }

  payrollTemplates() {
    this.router.navigate(['/payroll-templates']);
  }

}
