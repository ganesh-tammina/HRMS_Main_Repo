import { Component, Input, OnInit } from '@angular/core';
import { CandidateService, Employee } from '../../services/pre-onboarding.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ]
})
export class AboutusComponent implements OnInit {
  @Input() currentemp: any;
  aboutUs: any = [];
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {

    this.aboutUs = this.currentemp;

    console.log('Current Employeesssgtanesh:', this.aboutUs);


  }

}
