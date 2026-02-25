import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../payroll-service.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-template-composition',
  templateUrl: './template-composition.component.html',
  styleUrls: ['./template-composition.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink]
})
export class TemplateCompositionComponent implements OnInit {
  templateId: number | null = null;
  templateInfo: any = null;
  compositionData: any[] = [];
  loading: boolean = false;
  totalEarnings: number = 0;
  totalDeductions: number = 0;

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService
  ) { }

  trackById(index: number, item: any) {
    return item.id || item.component_id || index;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.templateId = +id;
        this.fetchTemplateDetails();
        this.fetchComposition();
      }
    });
  }

  fetchTemplateDetails() {
    if (!this.templateId) return;
    this.payrollService.getTemplateById(this.templateId).subscribe({
      next: (res: any) => {
        this.templateInfo = res.data || res;
      },
      error: (err) => console.error('Error fetching template details:', err)
    });
  }

  fetchComposition() {
    if (!this.templateId) return;
    this.loading = true;
    this.payrollService.getTemplateComposition(this.templateId).subscribe({
      next: (res: any) => {
        this.compositionData = Array.isArray(res) ? res : (res.data || []);
        this.calculateTotals();
        this.loading = false;
        console.log('Composition Data:', this.compositionData);
      },
      error: (err) => {
        console.error('Error fetching composition:', err);
        this.loading = false;
      }
    });
  }

  calculateTotals() {
    this.totalEarnings = this.compositionData
      .filter(c => (c.component_type || c.type)?.toLowerCase() === 'earning')
      .reduce((sum, c) => sum + Number(c.value || 0), 0);

    this.totalDeductions = this.compositionData
      .filter(c => (c.component_type || c.type)?.toLowerCase() === 'deduction')
      .reduce((sum, c) => sum + Number(c.value || 0), 0);
  }
}
