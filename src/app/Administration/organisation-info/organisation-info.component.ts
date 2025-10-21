import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CandidateService } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-organisation-info',
  templateUrl: './organisation-info.component.html',
  styleUrls: ['./organisation-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class OrganisationInfoComponent implements OnInit {
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  previewUrl: string | null = null;
  constructor(private candidateService: CandidateService) { }

  ngOnInit() { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imageUrl = e.target.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }
  onUpload() {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    this.candidateService.uploadImage(this.selectedFile).subscribe({
      next: (res) => {
        console.log('Uploaded successfully:', res);
        this.imageUrl = res.imageUrl; // URL from server
        this.candidateService.getImages().subscribe(images => {
          console.log('Images:', images);
        })
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }
}
