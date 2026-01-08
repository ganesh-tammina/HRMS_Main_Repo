import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonBadge, IonSearchbar, IonSelect, IonSelectOption, IonLabel, IonItem, IonAvatar,
    IonRefresher, IonRefresherContent, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { LeaveService } from '../services/leave.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-manager-leave-approvals',
    templateUrl: './manager-leave-approvals.page.html',
    styleUrls: ['./manager-leave-approvals.page.scss'],
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
        IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon,
        IonBadge, IonSearchbar, IonSelect, IonSelectOption, IonLabel, IonItem, IonAvatar,
        IonRefresher, IonRefresherContent, IonSpinner
    ]
})
export class ManagerLeaveApprovalsPage implements OnInit {
    pendingLeaves: any[] = [];
    filteredLeaves: any[] = [];
    isLoading = false;
    searchTerm = '';
    leaveTypeFilter = 'all';

    constructor(
        private leaveService: LeaveService,
        private alertController: AlertController,
        private toastController: ToastController,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadPendingLeaves();
    }

    loadPendingLeaves() {
        this.isLoading = true;
        this.leaveService.getPendingLeaves().subscribe({
            next: (leaves) => {
                this.pendingLeaves = leaves;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading pending leaves:', error);
                this.showToast('Failed to load pending leaves', 'danger');
                this.isLoading = false;
            }
        });
    }

    applyFilters() {
        this.filteredLeaves = this.pendingLeaves.filter(leave => {
            const matchesSearch = !this.searchTerm ||
                `${leave.FirstName} ${leave.LastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                leave.EmployeeNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesType = this.leaveTypeFilter === 'all' ||
                leave.type_code === this.leaveTypeFilter;

            return matchesSearch && matchesType;
        });
    }

    onSearchChange(event: any) {
        this.searchTerm = event.detail.value || '';
        this.applyFilters();
    }

    onTypeFilterChange(event: any) {
        this.leaveTypeFilter = event.detail.value;
        this.applyFilters();
    }

    async approveLeave(leave: any) {
        const alert = await this.alertController.create({
            header: 'Approve Leave',
            message: `Approve ${leave.FirstName} ${leave.LastName}'s ${leave.type_name} request for ${leave.total_days} day(s)?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Approve',
                    handler: () => {
                        this.performApprove(leave);
                    }
                }
            ]
        });

        await alert.present();
    }

    async rejectLeave(leave: any) {
        const alert = await this.alertController.create({
            header: 'Reject Leave',
            message: `Reject ${leave.FirstName} ${leave.LastName}'s ${leave.type_name} request?`,
            inputs: [
                {
                    name: 'rejection_reason',
                    type: 'textarea',
                    placeholder: 'Enter rejection reason (required)',
                    attributes: {
                        rows: 3
                    }
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Reject',
                    handler: (data) => {
                        if (!data.rejection_reason || data.rejection_reason.trim() === '') {
                            this.showToast('Please provide a rejection reason', 'warning');
                            return false;
                        }
                        this.performReject(leave, data.rejection_reason);
                        return true;
                    }
                }
            ]
        });

        await alert.present();
    }

    performApprove(leave: any) {
        this.isLoading = true;
        this.leaveService.approveLeave(leave.id).subscribe({
            next: () => {
                this.showToast('Leave approved successfully', 'success');
                this.loadPendingLeaves();
            },
            error: (error) => {
                console.error('Error approving leave:', error);
                this.showToast(error.error?.error || 'Failed to approve leave', 'danger');
                this.isLoading = false;
            }
        });
    }

    performReject(leave: any, reason: string) {
        this.isLoading = true;
        this.leaveService.rejectLeave(leave.id, reason).subscribe({
            next: () => {
                this.showToast('Leave rejected successfully', 'success');
                this.loadPendingLeaves();
            },
            error: (error) => {
                console.error('Error rejecting leave:', error);
                this.showToast(error.error?.error || 'Failed to reject leave', 'danger');
                this.isLoading = false;
            }
        });
    }

    async showToast(message: string, color: string = 'dark') {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            position: 'bottom',
            color
        });
        await toast.present();
    }

    handleRefresh(event: any) {
        this.loadPendingLeaves();
        setTimeout(() => {
            event.target.complete();
        }, 1000);
    }

    getStatusColor(status: string): string {
        const statusColors: any = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        };
        return statusColors[status?.toLowerCase()] || 'medium';
    }

    getProfileImage(leave: any): string {
        if (leave?.profile_image) {
            return `http://${environment.apiURL}${leave.profile_image}?t=${Date.now()}`;
        }
        return 'assets/user.svg';
    }
}
