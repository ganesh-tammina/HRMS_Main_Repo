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
export class EmployeeProfileModalComponent  implements OnInit {

 @Input() employee!: Candidate;  

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
  (this.employee as any).isAvailable = Math.random() > 0.5;
}


}
