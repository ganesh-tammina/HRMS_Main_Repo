import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
interface AttendanceRequestHistory {
  date: string;
  request: string;
  requestedOn: string;
  note: string;
  reason?: string;
  status: string;
  lastAction: string;
  nextApprover?: string;
}

@Component({
  selector: 'app-attendance-request',
  templateUrl: './attendance-request.component.html',
  styleUrls: ['./attendance-request.component.scss'],
  standalone:true,
  imports: [IonicModule, CommonModule]
})
export class AttendanceRequestComponent  implements OnInit {
  attendanceRequestsHistory: {
    type: string;
    dateRange: string;
    records: AttendanceRequestHistory[];
  }[] = [];

  constructor() { }

  ngOnInit() {
    this.attendanceRequestsHistory = [
      {
        type: 'Work From Home / On Duty Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [
          {
            date: '26 Aug 2025',
            request: 'Work From Home - 1 Day',
            requestedOn: '26 Aug 2025 12:30 PM by XYZ',
            note: 'working from home on this day.',
            reason: 'Personal',
            status: 'Approved',
            lastAction: 'ABC on 26 Aug',
          }
        ]
      },
      {
        type: 'Regularization Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [] // none
      },
      {
        type: 'Remote Clock In Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [
          {
            date: '19 Aug 2025',
            request: 'Remote Clock In',
            requestedOn: '19 Aug 2025 by Employee',
            note: 'I am working on some high-priority tasks.',
            status: 'Approved',
            lastAction: 'ABC on 19 Aug',
          },
          {
            date: '22 Aug 2025',
            request: 'Remote Clock In',
            requestedOn: '22 Aug 2025 by Employee',
            note: 'Working on some issues.',
            status: 'Approved',
            lastAction: 'ABC on 22 Aug',
          }
        ]
      },
      {
        type: 'Partial Day Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: []
      }
    ];


  }

}
