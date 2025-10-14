import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { CreateOfferHeaderComponent } from '../onboarding/create-offer-header/create-offer-header.component';
import { CandidateService } from '../services/pre-onboarding.service';

@Component({
  selector: 'app-salary-structure',
  templateUrl: './salary-staructure.component.html',
  styleUrls: ['./salary-staructure.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent,
    CreateOfferHeaderComponent,
    ReactiveFormsModule
  ],
})
export class salaryStaructureComponent implements OnInit {
  salaryForm!: FormGroup;
  salaryStructure: any = {};
  candidate: any = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private candidateService: CandidateService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras.state?.['candidate'] || {};
    console.log('Candidate:', this.candidate);
  }

  ngOnInit() {
    if (!this.candidate.packageDetails) {
      this.candidate.packageDetails = { annualSalary: '' };
    }

    this.salaryForm = this.fb.group({
      salary: [this.candidate.packageDetails.annualSalary || '', [Validators.required, Validators.min(1)]],
    });

    this.salaryForm.get('salary')?.valueChanges.subscribe((value) => {
      if (value && value > 0) {
        this.calculateSalary(+value);
      }
    });

    if (this.candidate.packageDetails.annualSalary) {
      this.calculateSalary(+this.candidate.packageDetails.annualSalary);
    }
  }

  calculateSalary(annualSalary: number) {
    const basic = annualSalary * 0.40;
    const hra = annualSalary * 0.16;
    const medical = 15000;
    const transport = 19200;
    const special = annualSalary - (basic + hra + medical + transport);

    const pfEmployer = basic * 0.12;
    const pfEmployee = basic * 0.12;

    this.salaryStructure = {
      basic,
      hra,
      medical,
      transport,
      special,
      subtotal: basic + hra + medical + transport + special,
      pfEmployer,
      pfEmployee,
      total: basic + hra + medical + transport + special + pfEmployer,
    };
  }

  onViewSalary() {
    if (this.salaryForm.invalid) {
      alert('Please enter a valid salary.');
      return;
    }
    const annualSalary = this.salaryForm.value.salary;
    this.calculateSalary(annualSalary);
  }

  goToOfferDetails() {
    if (this.salaryForm.invalid) {
      alert('Please enter salary before continuing.');
      return;
    }

    const annualSalary = this.salaryForm.value.salary;

    // ✅ Build package details
    this.candidate.packageDetails = {
      annualSalary,
      ...this.salaryStructure,
    };

    console.log('Candidate with Package Details:', this.candidate);

    if (!this.candidate.id) {
      alert('Candidate ID not found. Please go back and select a candidate.');
      this.router.navigate(['/previous-page']);
      return;
    }

    // ✅ Call new service method
    this.candidateService.addPackageDetails(this.candidate).subscribe({
      next: (res) => {
        console.log('Package details saved:', res);
        this.router.navigate(
          [
            '/OfferDetailsComponent',
            this.candidate.id,
            encodeURIComponent(this.candidate.personalDetails.FirstName || ''),
          ],
          { state: { candidate: this.candidate } }
        );
      },
      error: (err) => {
        console.error('Error saving package details:', err);
        alert('Failed to save package details. Please try again.');
      },
    });
  }
}
