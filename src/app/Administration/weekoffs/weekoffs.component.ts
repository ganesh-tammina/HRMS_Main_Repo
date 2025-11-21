import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeekoffService } from 'src/app/services/weekoffs.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-weekoff',
  templateUrl: './weekoffs.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
})
export class WeekoffComponent {

  weekoff = {
    week_off_policy_name: '',
    week_off_days: ''
  };

  constructor(private weekoffService: WeekoffService, private alertCtrl: AbortController) { }

  submit() {
    this.weekoffService.createWeekoff(this.weekoff).subscribe({
      next: (res: any) => {
        console.log('Saved successfully', res);
        alert('Weekoff policy added');
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }
}
