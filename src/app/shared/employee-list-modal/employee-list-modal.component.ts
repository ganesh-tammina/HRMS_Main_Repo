import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { CandidateSearchResult } from 'src/app/services/pre-onboarding.service';
import { EmployeeProfileModalComponent } from '../employee-profile-modal/employee-profile-modal.component';

@Component({
  selector: 'app-employee-list-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './employee-list-modal.component.html',
  styleUrls: ['./employee-list-modal.component.scss'],
})
export class EmployeeListModalComponent implements OnInit {

  // ✅ Data from header
  @Input() employees: any;
  employeeList: any;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.employeeList = this.employees;
    console.log('✅ Employees received in modalss:', this.employeeList);

  }

  async openEmployeeProfile(employee: any) {
    const modal = await this.modalCtrl.create({
      component: EmployeeProfileModalComponent,
      componentProps: { selectedEmployee:employee }
    });

    await modal.present();
  }


  close() {
    this.modalCtrl.dismiss();
  }
}
