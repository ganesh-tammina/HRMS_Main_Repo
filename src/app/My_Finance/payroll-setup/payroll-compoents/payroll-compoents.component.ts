import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from '../../payroll-service.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-compoents',
  templateUrl: './payroll-compoents.component.html',
  styleUrls: ['./payroll-compoents.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
})
export class PayrollCompoentsComponent implements OnInit {
  components: any[] = [];
  componentForm!: FormGroup;
  token = '';
  isModalOpen = false;
  structures: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.componentForm = this.fb.group({
      structure_id: [1, Validators.required],
      code: ['', Validators.required],
      name: ['', Validators.required],
      component_type: ['EARNING', Validators.required],
      calculation_type: ['FIXED', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      percentage_of_code: ['BASIC'],
      taxable: [true],
      prorated: [false],
      sequence: [10, Validators.required],
      notes: ['']
    });
    this.fetchComponents();
    this.fetchStructures();
  }

  fetchStructures() {
    this.payrollService.getPayrollstructures().subscribe((res: any) => {
      this.structures = Array.isArray(res) ? res : (res.data || []);
      console.log(this.structures);
      if (this.structures.length > 0) {
        this.componentForm.patchValue({ structure_id: this.structures[0].id });
      }
    });
  }

  fetchComponents() {
    this.payrollService.getPayrollComponents().subscribe((res: any) => {
      this.components = Array.isArray(res) ? res : (res.data || []);
    });
  }

  createComponent() {
    if (!this.token || this.componentForm.invalid) return;
    const formValue = this.componentForm.value;
    const payload = {
      ...formValue,
      value: Number(formValue.value),
      sequence: Number(formValue.sequence),
      structure_id: Number(formValue.structure_id)
    };

    // remove percentage_of_code if calculation_type is FIXED
    if (payload.calculation_type === 'FIXED') {
      delete payload.percentage_of_code;
    }

    this.payrollService.createPayrollComponent(payload).subscribe(() => {
      this.componentForm.reset({
        structure_id: 1,
        component_type: 'EARNING',
        calculation_type: 'FIXED',
        percentage_of_code: 'BASIC',
        taxable: true,
        prorated: false,
        sequence: 10,
        value: 0
      });
      this.isModalOpen = false;
      this.fetchComponents();
    });
  }

  getTotal() {
    return this.components.reduce((sum, c) => sum + Number(c.value), 0);
  }
  goBack() {
    this.router.navigate(['/masterpayroll']);
  }
}
