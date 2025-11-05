import { Component, OnInit } from '@angular/core';
import { CandidateService, Employee } from '../../services/pre-onboarding.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule, 
    ReactiveFormsModule,
    CommonModule,
  ]
})

export class ProfileComponent  implements OnInit {
  currentemp: any;
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  Isedit: boolean = false;
  isAdress: boolean = false;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {
    this.currentEmployee$ = this.candidateService.currentEmployee$;

    this.currentEmployee$.subscribe((emp: any) => {
      if (Array.isArray(emp) && emp.length > 0) {
        this.currentemp = emp[0]; // ✅ pick first employee object
      } else {
        this.currentemp = emp; // if it's already a single object
      }

      console.log('Current Employee:', this.currentemp);
    });
  }
  isEditForm() {
    this.Isedit = !this.Isedit;
  }
  isEditAddress() {
    this.isAdress = !this.isAdress;
  }
}
