import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { WorkFromHomeService } from 'src/app/services/work-from-home.service';

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
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AttendanceRequestComponent implements OnInit {

  attendanceRequestsHistory: {
    type: string;
    dateRange: string;
    records: AttendanceRequestHistory[];
  }[] = [];

  constructor(private wfhService: WorkFromHomeService) { }

  ngOnInit() {
    this.initializeStaticSections();
    this.loadWFHRequests();
  }

  /* ================= STATIC SECTIONS ================= */
  private initializeStaticSections() {
    this.attendanceRequestsHistory = [
      {
        type: 'Work From Home / On Duty Requests',
        dateRange: '',
        records: [], // will be filled from API
      },
      {
        type: 'Regularization Requestsss',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [],
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
        ],
      },
      {
        type: 'Partial Day Requests',
        dateRange: '19 Aug 2025 - 02 Oct 2025',
        records: [],
      },
    ];
  }

  /* ================= LOAD WFH ================= */
  private loadWFHRequests() {
    this.wfhService.getAllWFHRequests().subscribe({
      next: (res: any[]) => {
        console.log(res);
        const wfhRecords: AttendanceRequestHistory[] = res.map(item => ({
          date: this.formatDate(item.applied_at),
          request: 'Work From Home',
          requestedOn: this.formatRequestedOn(item.created_at),
          note: item.reason,
          reason: 'WFH',
          status: this.formatStatus(item.status),
          lastAction: item.updated_by || '-',
          nextApprover: item.next_approver || '-',
        }));

        const wfhGroup = this.attendanceRequestsHistory.find(
          g => g.type === 'Work From Home / On Duty Requests'
        );

        if (wfhGroup) {
          wfhGroup.records = wfhRecords;
          wfhGroup.dateRange = this.calculateDateRange(wfhRecords);
        }
      },
      error: () => {
        // Fail safe → show empty list
        const wfhGroup = this.attendanceRequestsHistory.find(
          g => g.type === 'Work From Home / On Duty Requests'
        );
        if (wfhGroup) {
          wfhGroup.records = [];
        }
      },
    });
  }

  /* ================= HELPERS ================= */
  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatRequestedOn(createdAt: string): string {
    if (!createdAt) return '-';
    const d = new Date(createdAt);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatStatus(status: string): string {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending';
  }

  private calculateDateRange(records: AttendanceRequestHistory[]): string {
    if (!records.length) return '';

    const dates = records.map(r => new Date(r.date));
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));

    return `${this.formatDate(min.toISOString())} - ${this.formatDate(
      max.toISOString()
    )}`;
  }
}
