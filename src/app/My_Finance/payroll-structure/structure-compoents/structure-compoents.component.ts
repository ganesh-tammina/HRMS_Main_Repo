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
      // Mapping fields (for Add mode)
      component_id: [null],
      formula_or_value: [''],

      // Full fields (for Edit mode / Syncing)
      code: ['', Validators.required],
      name: ['', Validators.required],
      component_type: ['EARNING', Validators.required],
      calculation_type: ['FIXED', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      percentage_of_code: ['BASIC'],
      taxable: [true],
      prorated: [false],
      sequence: [10, Validators.required],
      notes: [''],
      created_by: [Number(localStorage.getItem('employee_id')) || 1, Validators.required]
    });

    // Add mode requires formula_or_value and component_id
    // But Edit mode doesn't need component_id (it uses selectedComponentId)
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
    const ctc = Number(this.structureInfo?.ctc_amount) || 0;
    const calculatedAmts: { [code: string]: number } = { 'CTC': ctc };

    // Pass 1: Handle FIXED values and PERCENTAGE OF CTC
    this.compositionData.forEach(c => {
      if (c.calculation_type === 'FIXED') {
        calculatedAmts[c.code] = Number(c.value) || 0;
      } else if (c.calculation_type === 'PERCENTAGE' && (c.percentage_of_code === 'CTC' || !c.percentage_of_code)) {
        calculatedAmts[c.code] = (ctc * (Number(c.value) || 0)) / 100;
      }
    });

    // Pass 2: Handle PERCENTAGE OF other components (e.g., HRA as % of BASIC)
    // We do one pass which assumes BASIC is calculated in Pass 1
    this.compositionData.forEach(c => {
      if (c.calculation_type === 'PERCENTAGE' && c.percentage_of_code && c.percentage_of_code !== 'CTC') {
        const baseAmt = calculatedAmts[c.percentage_of_code] || 0;
        calculatedAmts[c.code] = (baseAmt * (Number(c.value) || 0)) / 100;
      }
    });

    // Final Pass: Sum them up and attach calculated_amount to the object for UI
    this.totalEarnings = 0;
    this.totalDeductions = 0;

    this.compositionData.forEach(c => {
      const realAmt = calculatedAmts[c.code] || 0;
      c.calculated_amount = realAmt;

      if ((c.component_type)?.toUpperCase() === 'EARNING') {
        this.totalEarnings += realAmt;
      } else if ((c.component_type)?.toUpperCase() === 'DEDUCTION') {
        this.totalDeductions += realAmt;
      }
    });
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
      component_type: 'EARNING',
      calculation_type: 'FIXED',
      percentage_of_code: 'BASIC',
      taxable: true,
      prorated: false,
      sequence: 10,
      value: 0,
      created_by: Number(localStorage.getItem('employee_id')) || 1
    });

    // Toggle validators for Add mode
    this.compositionForm.get('component_id')?.setValidators([Validators.required]);
    this.compositionForm.get('formula_or_value')?.setValidators([Validators.required]);
    this.compositionForm.updateValueAndValidity();
  }

  editComponent(comp: any) {
    this.isEditMode = true;
    this.selectedComponentId = comp.id;
    this.isModalOpen = true;

    // Clear "Add" mode validators
    this.compositionForm.get('component_id')?.clearValidators();
    this.compositionForm.get('formula_or_value')?.clearValidators();
    this.compositionForm.updateValueAndValidity();

    // Set search term for employee
    const creator = this.employees.find(e => e.id === (comp.created_by || this.structureInfo?.created_by));
    this.employeeSearchTerm = creator ? creator.FullName : '';
    this.filteredEmployees = [];

    this.compositionForm.patchValue({
      code: comp.code,
      name: comp.name,
      component_type: comp.component_type,
      calculation_type: comp.calculation_type,
      value: comp.value,
      percentage_of_code: comp.percentage_of_code,
      taxable: comp.taxable,
      prorated: comp.prorated,
      sequence: comp.sequence,
      notes: comp.notes,
      created_by: comp.created_by || this.structureInfo?.created_by || 1
    });
  }

  saveComponent() {
    if (this.compositionForm.invalid || !this.structureId) return;

    const formValue = this.compositionForm.value;
    let payload: any;

    if (this.isEditMode) {
      // Full edit mode (like PayrollCompoentsComponent)
      payload = {
        structure_id: this.structureId,
        code: formValue.code,
        name: formValue.name,
        component_type: formValue.component_type,
        calculation_type: formValue.calculation_type,
        value: Number(formValue.value),
        percentage_of_code: formValue.percentage_of_code,
        taxable: !!formValue.taxable,
        prorated: !!formValue.prorated,
        sequence: Number(formValue.sequence),
        notes: formValue.notes,
        created_by: Number(formValue.created_by)
      };

      if (payload.calculation_type === 'FIXED') {
        delete payload.percentage_of_code;
      }
    } else {
      // Mapping mode (Add)
      const masterComp = this.availableComponents.find(c => c.id == formValue.component_id);
      if (!masterComp) {
        alert('Invalid component selected');
        return;
      }

      // Parse formula or value
      let fValue = formValue.formula_or_value.toString();
      let calculationType = 'FIXED';
      let numericValue = 0;

      if (fValue.includes('%')) {
        calculationType = 'PERCENTAGE';
        numericValue = parseFloat(fValue.replace('%', '').trim());
      } else {
        numericValue = parseFloat(fValue.trim());
      }

      payload = {
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
    }

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

