import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Candidate } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-employee-profile-modal',
  templateUrl: './employee-profile-modal.component.html',
  styleUrls: ['./employee-profile-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class EmployeeProfileModalComponent implements OnInit {

  @Input() selectedEmployee: any;
  selectedObeject: any

  constructor(private modalCtrl: ModalController) { }
  ngOnInit() {
    this.selectedObeject = this.selectedEmployee
    console.log('Employee data in profile modal ganesh:', this.selectedEmployee);

  }

  close() {
    this.modalCtrl.dismiss();
  }




}
