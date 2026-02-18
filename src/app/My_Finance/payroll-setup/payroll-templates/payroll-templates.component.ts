import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payroll-templates',
  templateUrl: './payroll-templates.component.html',
  styleUrls: ['./payroll-templates.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PayrollTemplatesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }



}
