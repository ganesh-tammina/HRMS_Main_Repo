import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, CommonModule]
})
export class ShiftsComponent implements OnInit {
  shiftForm!: FormGroup;
  shiftsDetails:any

  constructor(private fb: FormBuilder, private shiftService: CandidateService) { }

  ngOnInit(): void {
    this.shiftForm = this.fb.group({
      shift_name: ['', Validators.required],
      check_in: ['', Validators.required],
      check_out: ['', Validators.required]
    });
    this.shiftService.getShifts(this.shiftForm.value).subscribe((res: any) => {
      console.log(res)
      alert('Shift Saved Successfully!');
      this.shiftsDetails = res;
    });
  }

  submitShift() {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }
    this.shiftService.getShifts(this.shiftForm.value).subscribe((res: any) => {
      console.log(res)
      alert('Shift Saved Successfully!');
      this.shiftsDetails = res;
      console.log("shiftDetails", this.shiftsDetails);
    });
  }
  isModalOpen = false;

  OpenForm(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
}
