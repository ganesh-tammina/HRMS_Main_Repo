import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollTemplatesService } from '../payroll-templates/payroll-templates.service';

@Component({
  selector: 'app-payroll-compoents',
  templateUrl: './payroll-compoents.component.html',
  styleUrls: ['./payroll-compoents.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PayrollCompoentsComponent implements OnInit {
  components: any[] = [];
  componentForm!: FormGroup;
  token = '';

  constructor(
    private payrollTemplatesService: PayrollTemplatesService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.componentForm = this.fb.group({
      name: ['', Validators.required],
      type: ['Earning', Validators.required],
      is_statutory: [false],
      is_taxable: [true],
      calculation_type: ['Flat', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      formula: [''] // Only used if calculation_type is Formula
    });
    this.fetchComponents();
  }

  fetchComponents() {
    if (!this.token) return;
    this.payrollTemplatesService.getComponentList(this.token).subscribe((res: any) => {
      this.components = Array.isArray(res) ? res : (res.data || []);
    });
  }

  createComponent() {
    if (!this.token || this.componentForm.invalid) return;
    const formValue = this.componentForm.value;
    const payload = {
      ...formValue,
      value: Number(formValue.value),
      formula: formValue.calculation_type === 'Formula' ? formValue.formula : undefined
    };
    this.payrollTemplatesService.createComponent(payload, this.token).subscribe(() => {
      this.componentForm.reset({
        type: 'Earning',
        is_statutory: false,
        is_taxable: true,
        calculation_type: 'Flat',
        value: 0,
        formula: ''
      });
      this.fetchComponents();
    });
  }

  getTotal() {
    return this.components.reduce((sum, c) => sum + Number(c.value), 0);
  }
}
