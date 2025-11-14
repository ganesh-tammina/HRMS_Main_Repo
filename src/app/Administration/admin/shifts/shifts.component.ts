import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CandidateService } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ShiftsComponent implements OnInit {
  shiftForm!: FormGroup;

  constructor(private fb: FormBuilder, private shiftService: CandidateService) { }

  ngOnInit(): void {
    this.shiftForm = this.fb.group({
      shift_name: ['', Validators.required],
      check_in: ['', Validators.required],
      check_out: ['', Validators.required]
    });
  }

  submitShift() {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }

    this.shiftService.getShifts(this.shiftForm.value).subscribe((res: any) => {

      alert('Shift Saved Successfully!');

      console.log(res);
    });

    console.log('Shift Data:', this.shiftForm.value);
  }
}
