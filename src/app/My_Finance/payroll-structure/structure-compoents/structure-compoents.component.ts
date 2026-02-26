import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../../payroll-service.service';
import { IonicModule } from '@ionic/angular';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-structure-compoents',
  templateUrl: './structure-compoents.component.html',
  styleUrls: ['./structure-compoents.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, ReactiveFormsModule]
})
export class StructureCompoentsComponent implements OnInit {
  structureId: number | null = null;
  structureInfo: any = null;
  compositionData: any[] = [];
  loading: boolean = false;
  totalEarnings: number = 0;
  totalDeductions: number = 0;

  isModalOpen = false;
  isEditMode = false;
  selectedComponentId: number | null = null;
  compositionForm!: FormGroup;
  availableComponents: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  employeeSearchTerm: string = '';

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService,
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.initForm();
    this.fetchEmployees();
    this.fetchAvailableComponents();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.structureId = +id;
        this.fetchStructureDetails();
      }
    });
  }

  initForm() {
    this.compositionForm = this.fb.group({
      component_id: [null, Validators.required],
      formula_or_value: ['', Validators.required],
      created_by: [Number(localStorage.getItem('employee_id')) || 1, Validators.required]
    });
  }

  fetchEmployees() {
    this.employeeService.getAllEmployees().subscribe((res: any) => {
      this.employees = res;
      this.filteredEmployees = res;
    });
  }

  filterEmployees(event: any) {
    const term = event.target.value.toLowerCase();
    this.employeeSearchTerm = term;
    if (!term) {
      this.filteredEmployees = this.employees;
      return;
    }
    this.filteredEmployees = this.employees.filter(emp =>
      emp.FullName.toLowerCase().includes(term) ||
      emp.EmployeeNumber?.toLowerCase().includes(term)
    );
  }

  selectEmployee(emp: any) {
    this.compositionForm.patchValue({ created_by: emp.id });
    this.employeeSearchTerm = emp.FullName;
    this.filteredEmployees = [];
  }

  fetchAvailableComponents() {
    this.payrollService.getPayrollComponents().subscribe((res: any) => {
      this.availableComponents = Array.isArray(res) ? res : (res.data || []);
    });
  }

  fetchStructureDetails() {
    if (!this.structureId) return;
    this.loading = true;
    this.payrollService.getPayrollStructureById(this.structureId).subscribe({
      next: (res: any) => {
        const fullData = res.data || res;
        this.structureInfo = fullData.structure || fullData;
        this.compositionData = fullData.components || fullData.salary_components || [];
        this.calculateTotals();
        this.loading = false;
        console.log('📦 Structure Details:', this.structureInfo);
      },
      error: (err) => {
        console.error('Error fetching structure details:', err);
        this.loading = false;
      }
    });
  }

  calculateTotals() {
    this.totalEarnings = this.compositionData
      .filter(c => (c.component_type)?.toLowerCase() === 'earning')
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);

    this.totalDeductions = this.compositionData
      .filter(c => (c.component_type)?.toLowerCase() === 'deduction')
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedComponentId = null;
    this.isModalOpen = true;
    this.employeeSearchTerm = '';
    this.filteredEmployees = this.employees;
    this.compositionForm.reset({
      component_id: null,
      formula_or_value: '',
      created_by: Number(localStorage.getItem('employee_id')) || 1
    });
  }

  editComponent(comp: any) {
    this.isEditMode = true;
    this.selectedComponentId = comp.id;
    this.isModalOpen = true;

    // Set search term for employee (we use structureInfo.created_by or default)
    const creator = this.employees.find(e => e.id === (comp.created_by || this.structureInfo?.created_by));
    this.employeeSearchTerm = creator ? creator.FullName : '';
    this.filteredEmployees = [];

    // Format value for display (e.g., 40 -> 40%)
    const displayValue = comp.calculation_type === 'PERCENTAGE' ? `${comp.value}%` : `${comp.value}`;

    this.compositionForm.patchValue({
      component_id: comp.master_component_id || comp.id, // Fallback
      formula_or_value: displayValue,
      created_by: comp.created_by || this.structureInfo?.created_by || 1
    });
  }

  saveComponent() {
    if (this.compositionForm.invalid || !this.structureId) return;

    const formValue = this.compositionForm.value;
    const masterComp = this.availableComponents.find(c => c.id == formValue.component_id);

    if (!masterComp) {
      alert('Invalid component selected');
      return;
    }

    // Parse formula or value
    let value = formValue.formula_or_value.toString();
    let calculationType = 'FIXED';
    let numericValue = 0;

    if (value.includes('%')) {
      calculationType = 'PERCENTAGE';
      numericValue = parseFloat(value.replace('%', '').trim());
    } else {
      numericValue = parseFloat(value.trim());
    }

    const payload = {
      structure_id: this.structureId,
      code: masterComp.code,
      name: masterComp.name,
      component_type: masterComp.component_type,
      calculation_type: calculationType,
      value: numericValue,
      percentage_of_code: masterComp.percentage_of_code || (calculationType === 'PERCENTAGE' ? 'BASIC' : null),
      taxable: !!masterComp.taxable,
      prorated: !!masterComp.prorated,
      sequence: masterComp.sequence || 10,
      notes: masterComp.notes || '',
      created_by: Number(formValue.created_by)
    };

    if (this.isEditMode && this.selectedComponentId) {
      this.payrollService.updatePayrollComponent(this.selectedComponentId, payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.fetchStructureDetails();
        },
        error: (err) => {
          console.error('Error updating component:', err);
          alert('Failed to update component');
        }
      });
    } else {
      this.payrollService.createPayrollComponent(payload).subscribe({
        next: () => {
          this.isModalOpen = false;
          this.fetchStructureDetails();
        },
        error: (err) => {
          console.error('Error creating component:', err);
          alert('Failed to add component to structure');
        }
      });
    }
  }

  deleteComponent(id: number) {
    if (confirm('Are you sure you want to remove this component from the structure?')) {
      this.payrollService.deletePayrollComponent(id).subscribe({
        next: () => {
          this.fetchStructureDetails();
        },
        error: (err) => {
          console.error('Error deleting component:', err);
          alert('Failed to delete component');
        }
      });
    }
  }

  goBack() {
    window.history.back();
  }
}

