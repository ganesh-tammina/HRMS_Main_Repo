import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CandidateService } from '../services/pre-onboarding.service';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ProfileComponent } from './profile/profile.component';
import { JobTabComponent } from './job-tab/job-tab.component';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { AssetsTabComponent } from './assets-tab/assets-tab.component';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { environment } from 'src/environments/environment';
import { LeaveRequestsComponent } from '../leave-requests/leave-requests.component';
import { Subject, takeUntil, interval, take } from 'rxjs';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    AboutusComponent,
    ProfileComponent,
    JobTabComponent,
    DocumentTabComponent,
    AssetsTabComponent,
    HeaderComponent,
    LeaveRequestsComponent,
  ],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  currentemp: any = []; // Single employee object (kept original type/shape)
  currentEmployee: any;
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;
  previewImageUrl: string | null = null;
  isUploading: boolean = false;
  profileimg: any;
  updateimage: string = '';
  env: string = '';


  private destroy$ = new Subject<void>();

  constructor(
    private candidateService: CandidateService,
    private routeGuardService: RouteGuardService,
    private popoverController: PopoverController,
    private employeeService: EmployeeService,
    private router: Router,
    private navCtrl: NavController
  ) { }

  private currentEmployeeId: string | null = null;

  ngOnInit() {
    this.employeeService.getMyProfile().subscribe({
      next: (res: any) => {
        if (res)
          this.currentEmployee = res;
        console.log(res, 'hello');
      }
    });
    this.env = environment.apiURL.startsWith('http') ? environment.apiURL : `http://${environment.apiURL}`;
    console.log(this.env);

    // Load existing image from localStorage
    // this.uploadedImageUrl = localStorage.getItem('uploadedImageUrl');

    // // Initial fetch if employeeID exists
    // if (this.routeGuardService.employeeID) {
    //   this.currentEmployeeId = this.routeGuardService.employeeID;
    //   this.refreshEmployee();
    // } else {
    //   console.warn(
    //     '⚠️ No employeeID found in routeGuardService on init — will retry for a short period'
    //   );

    //   // Retry loop up to 8 seconds to see if employeeID becomes available
    //   interval(1000)
    //     .pipe(take(8), takeUntil(this.destroy$))
    //     .subscribe({
    //       /*************  ✨ Windsurf Command ⭐  *************/
    //       /**
    //        * Called when the retry loop completes. If the employeeID has become available,
    //        * sets the currentEmployeeId and calls refreshEmployee() to fetch the employee data.
    //        */
    //       /*******  56e40ed0-fb04-42da-bc49-20abb100f482  *******/
    //       next: () => {
    //         if (this.routeGuardService.employeeID) {
    //           console.log(
    //             'ℹ️ employeeID became available during retry loop:',
    //             this.routeGuardService.employeeID
    //           );
    //           this.currentEmployeeId = this.routeGuardService.employeeID;
    //           this.refreshEmployee();
    //         }
    //       },
    //       complete: () => {
    //         if (!this.routeGuardService.employeeID) {
    //           console.warn(
    //             '⚠️ employeeID still not available after retries. Call refreshEmployee() when it is set.'
    //           );
    //         }
    //       },
    //     });
    // }

    // // Check for employee changes every second
    // interval(1000)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     const currentId = this.routeGuardService.employeeID;
    //     if (currentId && currentId !== this.currentEmployeeId) {
    //       console.log(
    //         '🔄 Employee changed from',
    //         this.currentEmployeeId,
    //         'to',
    //         currentId
    //       );
    //       this.currentEmployeeId = currentId;
    //       this.clearCachedData();
    //       this.uploadedImageUrl = localStorage.getItem('uploadedImageUrl');
    //       this.refreshEmployee();
    //     }
    //   });
  }

  /**
   * Clear cached profile data
   */
  private clearCachedData() {
    this.currentemp = [];
    this.uploadedImageUrl = null;
    localStorage.removeItem('uploadedImageUrl');
    console.log('🧹 Cleared cached profile data');
  }

  /**
   * Fetch employee details from backend and update this.currentemp
   */
  private refreshEmployee() {
    if (!this.routeGuardService.employeeID) {
      console.warn('⚠️ refreshEmployee called but no employeeID available');
      return;
    }

    // this.candidateService
    //   //.getEmpDet()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response: any) => {
    //       if (response?.data?.length > 0) {
    //         this.currentemp = response.data[0];
    //         console.log('🔁 Employee Details refreshed:', this.currentemp);

    //         // If backend provides profile image path, create a full URL & cache-bust
    //         if (this.currentemp.profile_image) {
    //           const ipBase = 'https://30.0.0.78:3562';
    //           const prefix = /^https?:\/\//i.test(this.currentemp.profile_image)
    //             ? ''
    //             : ipBase;
    //           const fullImageUrl = `${prefix}${this.currentemp.profile_image}`;
    //           const cacheBusted = `${fullImageUrl}${
    //             fullImageUrl.includes('?') ? '&' : '?'
    //           }t=${Date.now()}`;
    //           this.uploadedImageUrl = cacheBusted;
    //           localStorage.setItem('uploadedImageUrl', cacheBusted);
    //           try {
    //             localStorage.setItem('uploadedImageUrl', cacheBusted);
    //             console.log(
    //               '💾 Image URL saved to localStorage (from refresh):',
    //               cacheBusted
    //             );
    //           } catch (err) {
    //             console.warn(
    //               '⚠️ Could not save uploadedImageUrl to localStorage:',
    //               err
    //             );
    //           }
    //         }
    //       } else {
    //         console.warn('⚠️ No employee data found in response');
    //         this.currentemp = [];
    //       }
    //     },
    //     // error: (err) => {
    //     //   console.error('❌ Error fetching employee details:', err);
    //     // },
    //   });
  }

  onFileSelected($event: any) {
    const file = $event.target.files && $event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      console.log('📸 Selected file:', this.selectedFile);
    }
  }

  uploadProfilePic() {
    if (!this.selectedFile) {
      alert('⚠️ Please select a profile picture first!');
      return;
    }

    this.isUploading = true;

    this.employeeService.uploadProfileImage(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.updateimage = res.imagePath;
          this.profileimg = this.env + this.updateimage;
          console.log('✅ Image path:', this.updateimage);
          console.log('✅ Full URL:',);


          this.currentEmployee.image =
            this.updateimage + '?t=' + Date.now();

          this.isUploading = false;
        },
        error: (err) => {
          console.error('❌ Image upload failed:', err);
          this.isUploading = false;
        }
      });
  }

  edit() {
    console.log('edit');
  }

  // Expose a public method to force refresh externally if needed
  public forceRefresh() {
    this.refreshEmployee();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
