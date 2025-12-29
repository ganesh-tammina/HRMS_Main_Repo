import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { AdminSetup } from 'src/app/services/admin-setup.service';

@Component({
  selector: 'app-master-admin-setup',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './master-admin-setup.component.html',
  styleUrls: ['./master-admin-setup.component.scss'],
})
export class MasterAdminSetupComponent implements OnInit {

  users: any[] = [];
  loading = false;

  constructor(
    private adminSetupService: AdminSetup,
    private toastCtrl: ToastController
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  /** ✅ LOAD USERS */
  loadUsers(): void {
    this.loading = true;

    this.adminSetupService.getUsers().subscribe({
      next: (res: any) => {
        console.log('RAW API RESPONSE 👉', res);
        console.log('IS ARRAY?', Array.isArray(res?.users));
        console.log('USERS VALUE 👉', res?.users);

        // 🔒 FORCE ARRAY — NO MATTER WHAT
        if (Array.isArray(res?.users)) {
          this.users = res.users;
        } else {
          this.users = [];
        }

        console.log('FINAL USERS 👉', this.users);
        console.log('FINAL IS ARRAY?', Array.isArray(this.users));

        this.loading = false;
      },
      error: (err) => {
        console.error('API ERROR 👉', err);
        this.users = [];
        this.loading = false;
      }
    });
  }

  /** ✅ MAKE HR */
  makeHR(userId: number): void {
    this.adminSetupService.makeHR(userId).subscribe({
      next: () => {
        this.presentToast('User promoted to HR');
        this.loadUsers();
      },
      error: () => this.presentToast('Failed to promote to HR'),
    });
  }

  /** ✅ MAKE MANAGER */
  makeManager(userId: number): void {
    this.adminSetupService.makeManager(userId).subscribe({
      next: () => {
        this.presentToast('User promoted to Manager');
        this.loadUsers();
      },
      error: () => this.presentToast('Failed to promote to Manager'),
    });
  }

  /** ✅ MAKE ADMIN */
  makeAdmin(userId: number): void {
    this.adminSetupService.makeAdmin(userId).subscribe({
      next: () => {
        this.presentToast('User promoted to Admin');
        this.loadUsers();
      },
      error: () => this.presentToast('Failed to promote to Admin'),
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }
}
