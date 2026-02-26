import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PayrollService } from '../payroll-service.service';

@Component({
  selector: 'app-payroll-structure',
  templateUrl: './payroll-structure.component.html',
  styleUrls: ['./payroll-structure.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PayrollStructureComponent implements OnInit {
  structures: any[] = [];
  loading = true;
  activeCount = 0;
  inactiveCount = 0;

  constructor(
    private payrollService: PayrollService,
    private router: Router
  ) { }

  ngOnInit() {
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
