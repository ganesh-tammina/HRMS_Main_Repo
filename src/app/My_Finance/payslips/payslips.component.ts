import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IonicModule } from '@ionic/angular';
import { EmployeeService } from 'src/app/services/employee.service';

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
  monthlySalary: number | null = null;
  constructor(private candidateService: CandidateService, private EmployeeService: EmployeeService) { }

  ngOnInit() {
    this.EmployeeService.getMyProfile().subscribe((data: any) => {
      this.currentEmployee = data;
      console.log('Employee Data Retrieved:', data.lpa);
      if (data.lpa) {
        this.monthlySalary = Math.round((data.lpa / 12) * 100) / 100;
        console.log('Calculated Monthly Salary:', this.monthlySalary);
      } else {
        this.monthlySalary = null;
      }
      console.log('Current Employee Data:', this.currentEmployee);
    })
  }
}
