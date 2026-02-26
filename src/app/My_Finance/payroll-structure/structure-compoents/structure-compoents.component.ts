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
  loading: boolean = false;

  isModalOpen = false;
  isEditMode = false;
  selectedComponentId: number | null = null;
  componentForm!: FormGroup;
  components: any[] = [];
  availableComponents: any[] = [];
  employees: any[] = [];
  filteredEmployees: any[] = [];
  employeeSearchTerm: string = '';
  totalEarnings: number = 0;
  totalDeductions: number = 0;

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
    this.componentForm = this.fb.group({
      component_id: [null], // For adding existing components
      code: ['', Validators.required],
      name: ['', Validators.required],
      component_type: ['EARNING', Validators.required],
      calculation_type: ['FIXED', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      percentage_of_code: [''],
      taxable: [true],
      prorated: [false],
      sequence: [10],
      notes: [''],
      created_by: [Number(localStorage.getItem('employee_id')) || 1, Validators.required]
    });
  }

  fetchEmployees() {
    this.employeeService.getAllEmployees().subscribe(res => {
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
    this.componentForm.patchValue({ created_by: emp.id });
    this.employeeSearchTerm = emp.FullName;
    this.filteredEmployees = [];
  }

  fetchAvailableComponents() {
    this.payrollService.getPayrollComponents().subscribe((res: any) => {
      this.availableComponents = Array.isArray(res) ? res : (res.data || []);
    });
  }

  onComponentSelect(event: any) {
    const compId = Number(event.target.value);
    const selected = this.availableComponents.find(c => c.id === compId);
    if (selected) {
      this.componentForm.patchValue({
        code: selected.code,
        name: selected.name,
        component_type: selected.component_type,
        calculation_type: selected.calculation_type,
        value: selected.value,
        percentage_of_code: selected.percentage_of_code,
        taxable: !!selected.taxable,
        prorated: !!selected.prorated,
        sequence: selected.sequence,
        notes: selected.notes
      });
    }
  }

  fetchStructureDetails() {
    if (!this.structureId) return;
    this.loading = true;
    this.payrollService.getPayrollStructureById(this.structureId).subscribe({
      next: (res: any) => {
        const fullData = res.data || res;
        this.structureInfo = fullData.structure || fullData;
        this.components = fullData.components || fullData.salary_components || [];
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

  openCreateModal() {
    this.isEditMode = false;
    this.selectedComponentId = null;
    this.isModalOpen = true;
    this.employeeSearchTerm = '';
    this.filteredEmployees = this.employees;
    this.componentForm.reset({
      component_id: null,
      component_type: 'EARNING',
      calculation_type: 'FIXED',
      value: 0,
      taxable: true,
      prorated: false,
      sequence: 10,
      created_by: Number(localStorage.getItem('employee_id')) || 1
    });
  }

  editComponent(comp: any) {
    this.isEditMode = true;
    this.selectedComponentId = comp.id;
    this.isModalOpen = true;

    // Set employee search term
    const creator = this.employees.find(e => e.id === comp.created_by);
    this.employeeSearchTerm = creator ? creator.FullName : '';
    this.filteredEmployees = [];

    this.componentForm.patchValue({
      component_id: comp.id,
      code: comp.code,
      name: comp.name,
      component_type: comp.component_type,
      calculation_type: comp.calculation_type,
      value: comp.value,
      percentage_of_code: comp.percentage_of_code,
      taxable: !!comp.taxable,
      prorated: !!comp.prorated,
      sequence: comp.sequence,
      notes: comp.notes,
      created_by: comp.created_by
    });
  }

  saveComponent() {
    if (this.componentForm.invalid || !this.structureId) return;

    const payload = {
      ...this.componentForm.value,
      structure_id: this.structureId,
      value: Number(this.componentForm.value.value),
      sequence: Number(this.componentForm.value.sequence),
      taxable: !!this.componentForm.value.taxable,
      prorated: !!this.componentForm.value.prorated
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
          alert('Failed to create component');
        }
      });
    }
  }

  deleteComponent(id: number) {
    if (confirm('Are you sure you want to delete this component?')) {
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

  calculateTotals() {
    this.totalEarnings = this.components
      .filter(c => (c.component_type)?.toLowerCase() === 'earning')
      .reduce((sum, c) => {
        const val = parseFloat(c.value);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

    this.totalDeductions = this.components
      .filter(c => (c.component_type)?.toLowerCase() === 'deduction')
      .reduce((sum, c) => {
        const val = parseFloat(c.value);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  }

  goBack() {
    window.history.back();
  }
}

