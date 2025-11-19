import { Component, Input, OnInit } from '@angular/core';
import { CandidateService, Employee } from '../../services/pre-onboarding.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-job-tab',
  templateUrl: './job-tab.component.html',
  styleUrls: ['./job-tab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ]
})
export class JobTabComponent implements OnInit {
  @Input() currentemp: any;

  currentCandidate$!: Observable<any>;
  currentEmployee$!: Observable<Employee | null>;
  IseditJob: boolean = false;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() {

  }
  IseditJobJob() {
    this.IseditJob = !this.IseditJob;
  }
}
