import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CandidateService, Employee } from '../services/pre-onboarding.service';
import { Observable } from 'rxjs';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ProfileComponent } from './profile/profile.component';
import { JobTabComponent } from './job-tab/job-tab.component';
import { DocumentTabComponent } from './document-tab/document-tab.component';
import { AssetsTabComponent } from './assets-tab/assets-tab.component';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { environment } from 'src/environments/environment';

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
  ]
})
export class ProfilePageComponent implements OnInit {
  currentemp: any = []; // Single employee object
  selectedFile: File | null = null;
  uploadedImageUrl: string | null = null;
  isUploading: boolean = false;
    private env = environment;
    private api = `https://${this.env.apiURL}/api/v1/`;

  constructor(
    private candidateService: CandidateService,
    private routeGuardService: RouteGuardService
  ) { }

  ngOnInit() {
    if (this.routeGuardService.employeeID) {
      this.candidateService.getEmpDet().subscribe({
        next: (response: any) => {
          if (response?.data?.length > 0) {
            this.currentemp = response.data[0]; // ✅ Pick first employee object
            console.log('✅ Employee Details:', this.currentemp);
          } else {
            console.warn('⚠️ No employee data found in response');
          }
        },
        error: (err) => {
          console.error('❌ Error fetching employee details:', err);
        },
      });
    } else {
      console.warn('⚠️ No employeeID found in routeGuardService');
    }
  }
  onFileSelected($event: any) {
    const file = $event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('📸 Selected file:', this.selectedFile);
    }
  }

  uploadProfilePic() {
    if (!this.selectedFile) {
      alert('⚠️ Please select a profile picture first!');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    const empId = this.routeGuardService.employeeID;

    if (empId) {
      // 👇 Corrected field name
      formData.append('image', this.selectedFile);
      formData.append('employee_id', empId);
    } else {
      console.warn('⚠️ No employeeID found in routeGuardService');
      return;
    }
    console.log('empId---->', empId)
    if (empId) {
      this.candidateService.uploadImage(formData).subscribe({
        next: (res: any) => {
          if (res) {
            console.log('✅ Image uploaded successfully:', res);
            const imageUrl = res.image;
            this.uploadedImageUrl = imageUrl

          }
        },
        error: (err: any) => {
          console.error('❌ Image upload failed:', err);
          this.isUploading = false;
        },
      });
    }

  }


  edit() {
    console.log('edit');
  }
}
