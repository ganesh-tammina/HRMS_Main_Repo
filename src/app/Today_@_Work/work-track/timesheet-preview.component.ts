import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-timesheet-preview',
    standalone: true,
    imports: [IonicModule, CommonModule],
    template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Work Log Preview</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p><strong>Date:</strong> {{ data.date | date }}</p>

      <ion-list>
        <ion-item *ngFor="let b of data.hours_breakdown">
          <ion-label>
            <h3>{{ b.hour }}</h3>
            <p>{{ b.task }}</p>
          </ion-label>
          <ion-badge slot="end">{{ b.hours }}h</ion-badge>
        </ion-item>
      </ion-list>

      <ion-item lines="none">
        <ion-label>
          <strong>Notes</strong>
          <p>{{ data.notes || '—' }}</p>
        </ion-label>
      </ion-item>

      <ion-item lines="none">
        <ion-label>Total Hours</ion-label>
        <ion-badge color="primary">{{ data.total_hours }} hrs</ion-badge>
      </ion-item>
    </ion-content>
  `,
})
export class TimesheetPreviewComponent {
    @Input() data: any;

    constructor(private modalCtrl: ModalController) { }

    close() {
        this.modalCtrl.dismiss();
    }
}
