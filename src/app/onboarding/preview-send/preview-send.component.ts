import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateOfferHeaderComponent } from '../create-offer-header/create-offer-header.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import {ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
@Component({
  selector: 'app-preview-send',
  templateUrl: './preview-send.component.html',
  styleUrls: ['./preview-send.component.scss'],
  standalone:true,
  imports:[    CommonModule,
    FormsModule,
    IonicModule,
    CreateOfferHeaderComponent,
    HeaderComponent]
})
export class PreviewSendComponent  implements OnInit {
  @Input() candidate: any = {};
    // candidate: any = {};
  selectedOption = 'template';
  selectedTemplate = 'SVS';
  previewText = '';
  uploadedFileName: string | null = null;

  constructor(
     private route: ActivatedRoute,
    private router: Router,    
    private candidateService: CandidateService 
  ) { }

  ngOnInit() {
        const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras?.state?.['candidate'] || {};

      this.route.queryParams.subscribe(params => {
      if (!this.candidate && params['candidate']) {
        try {
          this.candidate = JSON.parse(params['candidate']);
        } catch (e) {
          console.warn('Failed to parse candidate', e);
        }
      }
    });

    this.updatePreview();
  }
 updatePreview() {
    if (this.selectedTemplate === 'SVS') {
      this.previewText = `
        Dear ${this.candidate.personalDetails?.FirstName},
        <br><br>
        Welcome to <b>Tech Tammina Family</b>!! <br><br>
        It was a pleasure interacting with you during our hiring process and
        we believe you would make a great asset to {{CompanyInfo.CompanyName}}.
      `;
    } else {
      this.previewText = `
        Dear ${this.candidate.personalDetails?.FirstName},
        <br><br>
        Welcome to <b>Tech Tammina Family</b>!! <br><br>
        We are excited to have you onboard and look forward to seeing the best of your capabilities.
      `;
    }
  }

  onOptionChange(event: any) {
    this.selectedOption = event.detail.value;
  }

  onTemplateChange(event: any) {
    this.selectedTemplate = event.detail.value;
    this.updatePreview();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
      this.previewText = `<b>Custom Offer Letter uploaded:</b> ${file.name}`;
    }
  }

  createOffer() {
    console.log('Final Offer created for:', this.candidate);
    // Call API here to generate/send offer letter
  }
}