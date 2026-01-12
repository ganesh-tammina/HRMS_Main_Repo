import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PayslipsComponent implements OnInit {
  currentEmployee: any;
  one: any;
  full_name: string = ""
  currentTime: string = '';
  allEmployees: any[] = [];
  fullName: any;
  currentemp: any;
  employee_id: any;
  uploadedImageUrl: string | null = null;
  imageUrls: any;
  payslip: any = {}
  completepayroll: any = {}
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {
    this.candidateService.getEmpDet().subscribe({
      next: (response: any) => {
        this.allEmployees = response.data || [];

        if (this.allEmployees.length > 0) {

          this.one = this.allEmployees[0];
          this.fullName = this.one[0].reporting_to;
          this.employee_id = this.one[0].employee_id;

          // Get payslip
          this.candidateService.getpayslips(this.employee_id).subscribe((response: any) => {
            console.log("PaySlips:", response);

            if (response?.data && Array.isArray(response.data)) {
              this.payslip = response.data[0];
            } else if (Array.isArray(response)) {
              this.payslip = response[0];
            } else {
              this.payslip = response;
            }

            this.currentemp = this.one[0];

            // ✅ MERGE HERE (after both objects are available)
            this.completepayroll = {
              ...this.currentemp,
              ...this.payslip
            };

            this.completepayroll.total_earnings =
              (Number(this.payslip.basic) || 0) +
              (Number(this.payslip.hra) || 0) +
              (Number(this.payslip.medical_allowance) || 0) +
              (Number(this.payslip.transport_allowance) || 0) +
              (Number(this.payslip.special_allowance) || 0) +
              (Number(this.payslip.pf_employer) || 0);

            console.log("Merged completepayroll → ", this.completepayroll);
          });

          // Save ID
          localStorage.setItem('employee_id', this.employee_id);
          this.candidateService.setLoggedEmployeeId(this.employee_id);
        }
      },
      error: (err) => {
        console.error('Error fetching all employees:', err);
      },
    });
  }

}
