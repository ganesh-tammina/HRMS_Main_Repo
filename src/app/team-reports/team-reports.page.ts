import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { EmployeeService } from '../services/employee.service';
import { TimesheetService } from '../services/timesheets.service';
import { LeaverequestService } from '../services/leaverequest.service';
import { environment } from 'src/environments/environment';
import { TimesheetPreviewComponent } from '../Today_@_Work/work-track/timesheet-preview.component';

@Component({
    selector: 'app-team-reports',
    templateUrl: './team-reports.page.html',
    styleUrls: ['./team-reports.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class TeamReportsPage implements OnInit {

    reportType: 'timesheet' | 'leave' | 'attendance' = 'attendance';
    startDate: string = '';
    endDate: string = '';

    reportData: any[] = [];
    loading = false;

    // Stats for the selected report
    stats = {
        total: 0,
        present: 0,
        absent: 0,
        onLeave: 0
    };

    constructor(
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private timesheetService: TimesheetService,
        private leaveService: LeaverequestService,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController
    ) { }

    ngOnInit() {
        // Check for query parameter to set report type
        this.route.queryParams.subscribe(params => {
            if (params['type'] && ['timesheet', 'leave', 'attendance'].includes(params['type'])) {
                this.reportType = params['type'];
            }
        });

        // Default to current month
        const now = new Date();
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        this.fetchReport();
    }

    onReportTypeChange() {
        this.fetchReport();
    }

    onFiltersChange() {
        if (this.startDate && this.endDate) {
            this.fetchReport();
        }
    }

    async fetchReport() {
        this.loading = true;
        this.reportData = [];

        try {
            if (this.reportType === 'attendance') {
                this.fetchAttendanceReport();
            } else if (this.reportType === 'leave') {
                this.fetchLeaveReport();
            } else if (this.reportType === 'timesheet') {
                this.fetchTimesheetReport();
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            this.showToast('Failed to load report data', 'danger');
            this.loading = false;
        }
    }

    private fetchAttendanceReport() {
        // Reusing the existing team attendance report logic
        this.employeeService.getTeamAttendanceReport(this.startDate).subscribe({
            next: (res: any) => {
                this.reportData = res.attendance || [];
                this.stats.total = res.summary?.total_team || 0;
                this.stats.present = res.summary?.present || 0;
                this.stats.absent = res.summary?.absent || 0;
                this.stats.onLeave = res.summary?.on_leave || 0;
                this.loading = false;
            },
            error: (err) => {
                console.error('Attendance Report Error:', err);
                this.showToast('Error loading attendance report', 'danger');
                this.loading = false;
            }
        });
    }

    private fetchLeaveReport() {
        // For now, let's use the pending leaves or a simulated team leave list 
        // since a dedicated historical team leave report endpoint wasn't found.
        // In a real scenario, we'd call /api/leaves/report/team
        this.leaveService.getPendingLeaveRequests().subscribe({
            next: (res: any) => {
                this.reportData = res || [];
                this.loading = false;
            },
            error: (err) => {
                this.showToast('Error loading leave report', 'danger');
                this.loading = false;
            }
        });
    }

    private fetchTimesheetReport() {
        // Reusing manager pending timesheets as a starting point for the report
        const filters = {
            start_date: this.startDate,
            end_date: this.endDate
        };
        this.timesheetService.getManagerPendingTimesheets(filters).subscribe({
            next: (res: any) => {
                this.reportData = res || [];
                this.loading = false;
            },
            error: (err) => {
                this.showToast('Error loading timesheet report', 'danger');
                this.loading = false;
            }
        });
    }

    downloadReport() {
        if (!this.reportData || this.reportData.length === 0) {
            this.showToast('No data to download', 'warning');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";

        // Simple CSV generation based on report type
        if (this.reportType === 'attendance') {
            csvContent += "Employee,Email,Status,Date,Work Mode\n";
            this.reportData.forEach(row => {
                csvContent += `${row.employee_name},${row.email},${row.status},${row.date},${row.work_mode || '-'}\n`;
            });
        } else if (this.reportType === 'leave') {
            csvContent += "Employee,Type,From,To,Days,Status\n";
            this.reportData.forEach(row => {
                csvContent += `${row.FirstName} ${row.LastName},${row.type_name},${row.start_date},${row.end_date},${row.total_days},${row.status}\n`;
            });
        } else {
            csvContent += "Employee,Project,Date,Hours,Status\n";
            this.reportData.forEach(row => {
                csvContent += `${row.FirstName} ${row.LastName},${row.project_name || 'Regular'},${row.date},${row.total_hours},${row.status}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Team_${this.reportType}_Report_${this.startDate}_to_${this.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        this.showToast('Report downloaded as CSV', 'success');
    }

    /* ================= VIEW TIMESHEET ================= */

    async viewTimesheet(timesheet: any) {
        const modal = await this.modalCtrl.create({
            component: TimesheetPreviewComponent,
            cssClass: 'side-custom-popup view-work-log',
            componentProps: { data: timesheet },
        });
        await modal.present();
    }

    /* ================= DOWNLOAD EXCEL (Timesheet) ================= */

    downloadTimesheet(timesheet: any) {
        if (!timesheet || !timesheet.hours_breakdown?.length) {
            this.showToast('No timesheet data available to download', 'warning');
            return;
        }

        let tableRows = '';

        timesheet.hours_breakdown.forEach((b: any, index: number) => {
            tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td>${b.hour || '-'}</td>
          <td>${b.task || '-'}</td>
          <td>${b.hours || '-'}</td>
        </tr>
      `;
        });

        const formattedDate = this.formatDateDDMMYYYY(new Date(timesheet.date));

        const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8" />
    </head>
    <body>
      <table border="1">
        <tr><td>Employee</td><td colspan="3">${timesheet.FirstName} ${timesheet.LastName}</td></tr>
        <tr><td>Date</td><td colspan="3">${formattedDate}</td></tr>
        <tr>
          <th>S.No</th><th>Time</th><th>Task</th><th>Hours</th>
        </tr>
        ${tableRows}
        <tr><td>Note</td><td colspan="3">${timesheet.notes || '-'}</td></tr>
        <tr><td>Total</td><td colspan="3">${timesheet.total_hours}</td></tr>
      </table>
    </body>
    </html>
    `;

        const blob = new Blob([html], {
            type: 'application/vnd.ms-excel;charset=utf-8;'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Timesheet_${timesheet.FirstName}_${formattedDate}.xls`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast('Timesheet downloaded successfully', 'success');
    }

    private formatDateDDMMYYYY(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-based
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    getProfileImage(row: any): string {
        if (row?.profile_image) {
            return `http://${environment.apiURL}${row.profile_image}`;
        }
        return 'assets/user.svg';
    }

    async showToast(msg: string, color: string = 'dark') {
        const toast = await this.toastCtrl.create({
            message: msg,
            duration: 2000,
            color: color,
            position: 'top'
        });
        toast.present();
    }
}
