import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { LeaveService } from '../../services/leaves.services';

@Component({
  selector: 'app-leave-modal',
  templateUrl: './leave-modal.component.html',
  styleUrls: ['./leave-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, IonicModule]
})
export class LeaveModalComponent implements OnInit {
  leave_year_start: Date | null = null;
  leave_year_end: Date | null = null;
  casual_leave_allocated: number = 0;
  marriage_leave_allocated: number = 0;
  comp_offs_allocated: number = 0;
  medical_leave_allocated: number = 0;
  paid_leave_allocated: number = 0;
  

  years: number[] = [];
  leaveData: any = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveLeaves = new EventEmitter<any>();

  constructor(
    private leaveService: LeaveService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // Generate years from current year to next 10 years
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  }

  onSave() {
    if (!this.leave_year_start || !this.leave_year_end) {
      this.showAlert('Missing Fields', 'Please select both Start Year and End Year.');
      return;
    }

    const leaves = {
      leave_year_start: this.leave_year_start,
      leave_year_end: this.leave_year_end,
      casual_leave_allocated: this.casual_leave_allocated ?? 0,
      marriage_leave_allocated: this.marriage_leave_allocated ?? 0,
      comp_offs_allocated: this.comp_offs_allocated ?? 0,
      medical_leave_allocated: this.medical_leave_allocated ?? 0,
      paid_leave_allocated: this.paid_leave_allocated ?? 0,
    };

    console.log('Saving leaves:', leaves);

    // Save leave structure via LeaveService
    this.leaveService.saveLeaves(leaves).subscribe(
      async (response) => {
        console.log('Leaves saved successfully:', response);

        this.onClose();

        const alert = await this.alertCtrl.create({
          header: 'Success',
          message: 'Leave structure has been saved successfully!',
          buttons: ['OK']
        });
        await alert.present();
      },
      async (error) => {
        console.error('Error saving leaves:', error);

        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Failed to save leave structure. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }
  
  onClose() {
    this.closeModal.emit();
  }


  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
