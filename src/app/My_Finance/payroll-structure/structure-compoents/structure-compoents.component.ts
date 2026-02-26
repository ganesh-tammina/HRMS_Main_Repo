import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PayrollService } from '../../payroll-service.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-structure-compoents',
  templateUrl: './structure-compoents.component.html',
  styleUrls: ['./structure-compoents.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink]
})
export class StructureCompoentsComponent implements OnInit {
  structureId: number | null = null;
  structureInfo: any = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.structureId = +id;
        this.fetchStructureDetails();
      }
    });
  }

  fetchStructureDetails() {
    if (!this.structureId) return;
    this.loading = true;
    this.payrollService.getPayrollStructureById(this.structureId).subscribe({
      next: (res: any) => {
        // Assume res contains the structure and potentially its components
        this.structureInfo = res.data || res;
        this.loading = false;
        console.log('📦 Structure Details:', this.structureInfo);
      },
      error: (err) => {
        console.error('Error fetching structure details:', err);
        this.loading = false;
      }
    });
  }

  goBack() {
    window.history.back();
  }
}

