import { Component, Input, OnInit } from '@angular/core';
import { CandidateService, Employee } from '../../services/pre-onboarding.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReportingTEamComponent } from '../reporting-team/reporting-team.component';
import { QuillModule } from 'ngx-quill';

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
    ReportingTEamComponent,
    QuillModule
  ]
})
export class AboutusComponent implements OnInit {
  @Input() currentEmployee: any;
  aboutUs: any = [];
  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  IsSummary: boolean = false;
  IsOrg: boolean = false;
  viewEditor: boolean = false;
  // Reactive Forms control for Quill editor

  modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  constructor(private candidateService: CandidateService) { }

  ngOnInit() {

    this.aboutUs = this.currentEmployee;

    console.log('Current Employeesssgtanesh:', this.aboutUs);


  }
  isEditSummary() {
    this.IsSummary = !this.IsSummary;
  }
  isEditOrg() {
    this.IsOrg = !this.IsOrg;
  }
  
}
