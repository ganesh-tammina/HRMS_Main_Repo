import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../payroll-service.service';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';

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
    return item.composition_id || item.component_id || index;
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
        const rawComposition = Array.isArray(res) ? res : (res.data || []);
        console.log('Raw Composition Data:', rawComposition);

        if (rawComposition.length === 0) {
          this.compositionData = [];
          this.loading = false;
          return;
        }

        // Fetch component details for each composition item
        const componentRequests = rawComposition.map((item: any) =>
          this.payrollService.getComponentById(item.component_id)
        );

        (forkJoin(componentRequests) as any).subscribe({
          next: (componentResults: any[]) => {
            // Merge composition data with component details
            this.compositionData = rawComposition.map((item: any, index: number) => {
              const component = componentResults[index];
              // Handle both array and object responses
              const compData = Array.isArray(component) ? component[0] : (component?.data || component);
              return {
                ...item,
                // Component details
                component_name: compData?.name || compData?.component_name || `Component #${item.component_id}`,
                component_code: compData?.code || compData?.component_code || '-',
                component_type: compData?.type || compData?.component_type || '-',
                calculation_type: compData?.calculation_type || '-',
                percentage_of_code: compData?.percentage_of_code || compData?.base_code || null,
                value: item.formula_or_value || compData?.value || 0,
                is_taxable: compData?.taxable ?? compData?.is_taxable ?? false,
                is_prorated: compData?.prorated ?? compData?.is_prorated ?? false,
                sequence: compData?.sequence || 0,
                notes: compData?.notes || ''
              };
            });

            this.calculateTotals();
            this.loading = false;
            console.log('Enriched Composition Data:', this.compositionData);
          },
          error: (err: any) => {
            console.error('Error fetching component details:', err);
            // Fallback: show raw data without enrichment
            this.compositionData = rawComposition;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching composition:', err);
        this.loading = false;
      }
    });
  }

  calculateTotals() {
    this.totalEarnings = this.compositionData
      .filter(c => (c.component_type)?.toLowerCase() === 'earning')
      .reduce((sum, c) => {
        const val = parseFloat(c.value);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

    this.totalDeductions = this.compositionData
      .filter(c => (c.component_type)?.toLowerCase() === 'deduction')
      .reduce((sum, c) => {
        const val = parseFloat(c.value);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  }
}
