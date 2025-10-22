import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { EmailService } from 'src/app/services/email.service';
import { CandidateService } from 'src/app/services/pre-onboarding.service';

@Component({
  selector: 'app-create-offer-header',
  templateUrl: './create-offer-header.component.html',
  styleUrls: ['./create-offer-header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CreateOfferHeaderComponent implements OnInit {
  candidate: any = {};
  @Output() continueClick = new EventEmitter<void>();
  @Output() createOfferClick = new EventEmitter<void>();

  activeTab = '';
  isPreviewSend = false;
  candidateId: string | null = null;
  firstName: string | null = null; 

  // preview_send = false
  currentRoute: string = '';

  constructor(private router: Router, private email: EmailService, private candidateService: CandidateService, private route: ActivatedRoute) {
    // track active tab by URL
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const segments = event.urlAfterRedirects.split('/');
        this.activeTab = segments[segments.length - 1];
        this.isPreviewSend = this.activeTab === 'preview_send';
        // console.log("active:", this.activeTab);
        //        if (event instanceof NavigationEnd) {
        //   this.currentRoute = event.url;
        // }
      });
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * ngOnInit
   *
   * Gets candidate id and first name from parent route.
   * These values are used to construct the URL for navigating to different tabs.
   */
  /*******  ac28750e-21cd-4044-a6aa-d4fa9ca84802  *******/
  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.candidate = nav?.extras.state?.['candidate'] || {};

    // get id & firstName from parent route
    this.candidateId = this.route.snapshot.paramMap.get('id');
    this.firstName = this.route.snapshot.paramMap.get('FirstName');
  }

  onContinue() {
    this.continueClick.emit();
  }
  onCreateOffer() {
    this.createOfferClick.emit(); // You can handle final API call or navigation here
  }

  navigate(tab: string) {
    if (this.candidateId && this.firstName) {
      this.router.navigate(['/', tab, this.candidateId, this.firstName]);
      this.activeTab= tab;
    } else {
      console.error('Missing route params: id or firstName');
    }
  }
  onCreateOfferemail() {
    // Update candidate object

    // Call service to update candidate
    this.email.sendEmail(this.candidate).subscribe({
      next: (res : any) => {
        if (res.success) {
          alert('Email sent successfully!');
            } else {
        }
      }
    });

  }

}
