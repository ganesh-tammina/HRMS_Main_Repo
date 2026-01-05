import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { EmployeeProfileModalComponent } from '../employee-profile-modal/employee-profile-modal.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employee-list-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './employee-list-modal.component.html',
  styleUrls: ['./employee-list-modal.component.scss'],
})
export class EmployeeListModalComponent implements OnInit {

  /** ✅ DATA FROM HEADER */
  @Input() employees: any[] = [];

  employeeList: any[] = [];
  apiBaseUrl: string = '';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.employeeList = this.employees || [];

    this.apiBaseUrl = environment.apiURL.startsWith('http')
      ? environment.apiURL
      : `http://${environment.apiURL}`;

    console.log('✅ Employees received in modal:', this.employeeList);
  }

  /** ✅ PROFILE IMAGE HANDLER */
  getEmployeeImage(emp: any): string {

    if (emp?.profile_image) {
      return emp.profile_image.startsWith('http')
        ? emp.profile_image
        : `${this.apiBaseUrl}/${emp.profile_image}`;
    }

    if (emp?.image) {
      return emp.image.startsWith('http')
        ? emp.image
        : `${this.apiBaseUrl}/${emp.image}`;
    }

    // ✅ DEFAULT IMAGE
    return 'assets/icon/Default-user.svg';
  }

  /** OPEN EMPLOYEE PROFILE */
  async openEmployeeProfile(employee: any) {
    const modal = await this.modalCtrl.create({
      component: EmployeeProfileModalComponent,
      componentProps: { selectedEmployee: employee },
      cssClass: 'profile-modal'
    });

    await modal.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
