import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PayrollService } from '../payroll-service.service';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-payroll-structure',
  templateUrl: './payroll-structure.component.html',
  styleUrls: ['./payroll-structure.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule],
})
export class PayrollStructureComponent implements OnInit {
  structures: any[] = [];
  loading = true;
  activeCount = 0;
  inactiveCount = 0;

  isModalOpen = false;
  structureForm!: FormGroup;
  employees: any[] = [];
  availableComponents: any[] = [];
  selectedComponents: any[] = [];

  constructor(
    private payrollService: PayrollService,
    private router: Router,
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.initForm();
    this.fetchStructures();
    this.fetchEmployees();
    this.fetchComponents();
  }

  initForm() {
    this.structureForm = this.fb.group({
      employee_id: [null, Validators.required],
      structure_name: ['', Validators.required],
      ctc_amount: [0, [Validators.required, Validators.min(0)]],
      effective_from: [new Date().toISOString().split('T')[0], Validators.required],
      effective_to: [null],
      is_active: [true],
      notes: [''],
    });
  }

  fetchStructures() {
    this.loading = true;
    this.payrollService.getPayrollstructures().subscribe({
      next: (res: any) => {
        this.structures = Array.isArray(res) ? res : (res.data || []);
        this.activeCount = this.structures.filter(s => s.is_active).length;
        this.inactiveCount = this.structures.filter(s => !s.is_active).length;
        this.loading = false;
        console.log('📦 Payroll Structures:', this.structures);
      },
      error: (err: any) => {
        console.error('Failed to load structures:', err);
        this.loading = false;
      }
    });
  }

  fetchEmployees() {
    this.employeeService.getAllEmployees().subscribe(res => {
      this.employees = res;
    });
  }

  fetchComponents() {
    this.payrollService.getPayrollComponents().subscribe((res: any) => {
      this.availableComponents = Array.isArray(res) ? res : (res.data || []);
    });
  }

  addComponent(comp: any) {
    if (!this.selectedComponents.find(c => c.id === comp.id)) {
      this.selectedComponents.push(comp);
    }
  }

  removeComponent(index: number) {
    this.selectedComponents.splice(index, 1);
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.selectedComponents = [];
    this.structureForm.reset({
      employee_id: null,
      structure_name: '',
      ctc_amount: 0,
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: null,
      is_active: true,
      notes: '',
    });
  }

  saveStructure() {
    if (this.structureForm.invalid) return;

    const formValue = this.structureForm.value;
    const payload = {
      ...formValue,
      employee_id: Number(formValue.employee_id),
      ctc_amount: Number(formValue.ctc_amount),
      created_by: Number(localStorage.getItem('employee_id')) || 1,
      components: this.selectedComponents.map(c => ({
        code: c.code,
        name: c.name,
        component_type: c.component_type,
        calculation_type: c.calculation_type,
        value: Number(c.value),
        percentage_of_code: c.percentage_of_code,
        taxable: !!c.taxable,
        prorated: !!c.prorated,
        sequence: Number(c.sequence),
        notes: c.notes
      }))
    };

    this.payrollService.createPayrollStructure(payload).subscribe({
      next: () => {
        this.isModalOpen = false;
        this.fetchStructures();
      },
      error: (err) => {
        console.error('Error creating structure:', err);
        alert('Failed to create structure: ' + (err.error?.message || err.message));
      }
    });
  }

  formatCurrency(amount: string | number): string {
    const num = Number(amount);
    if (isNaN(num)) return '-';
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  getStatusLabel(isActive: number): string {
    return isActive ? 'Active' : 'Inactive';
  }

  viewDetails(structureId: number) {
    this.router.navigate(['/structure-composition', structureId]);
  }

  goBack() {
    this.router.navigate(['/masterpayroll']);
  }

  trackById(index: number, item: any) {
    return item.id || index;
  }
}
