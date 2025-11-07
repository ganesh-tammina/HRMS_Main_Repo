import { Component, Input, OnInit } from '@angular/core';
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

export class ProfileComponent implements OnInit {
  @Input() currentemp: any;

  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  Isedit: boolean = false;
  isAdress: boolean = false;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {



  }
  isEditForm() {
    this.Isedit = !this.Isedit;
  }
  isEditAddress() {
    this.isAdress = !this.isAdress;
  }
}
