import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-candidate-offer-letter',
  templateUrl: './candidate-offer-letter.component.html',
  styleUrls: ['./candidate-offer-letter.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class CandidateOfferLetterComponent implements OnInit {
  candidate: any = null;
  loading = true;
  error = '';
  acceptDisabled = false;
  rejectDisabled = false;
  offerStatus: 'pending' | 'accepted' | 'rejected' = 'pending';

  private apiBase = `http://${environment.apiURL}/api/candidates`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Try navigation state first (passed from CandidateStatusComponent)
    const nav = this.router.getCurrentNavigation();
    const stateCandidate = nav?.extras?.state?.['candidate'];

    if (stateCandidate) {
      this.candidate = stateCandidate;
      this.loading = false;
      console.log('✅ Candidate from nav state:', this.candidate);
      return;
    }

    // Fallback: fetch from backend using route param (when user refreshes)
    const candidateId = this.route.snapshot.paramMap.get('id');
    if (!candidateId) {
      this.loading = false;
      this.error = 'Invalid offer link.';
      return;
    }

    this.http.get<any>(`${this.apiBase}/${candidateId}`).subscribe({
      next: (res) => {
        const c = res?.candidate || res;
        this.candidate = {
          ...c,
          FirstName: c.first_name || c.FirstName,
          LastName: c.last_name || c.LastName,
          Email: c.email || c.Email,
          PhoneNumber: c.phone || c.PhoneNumber,
          JobTitle: c.position || c.designation_name || c.JobTitle,
          Department: c.department_name || c.Department,
          joining_date: c.joining_date,
          offered_ctc: c.offered_ctc,
          candidate_id: c.candidate_id,
          id: c.id
        };
        this.loading = false;
        console.log('✅ Candidate fetched from backend:', this.candidate);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Could not load offer details. Please try again.';
        console.error('❌ Error loading candidate:', err);
      }
    });
  }

  // ──────────────────────────────
  // Accept Offer
  // ──────────────────────────────
  async acceptOffer() {
    this.acceptDisabled = true;
    this.rejectDisabled = true;

    const candidateId = this.candidate?.candidate_id || this.candidate?.id;

    this.http.post<any>(`${this.apiBase}/${candidateId}/accept-offer`, {}).subscribe({
      next: async () => {
        this.offerStatus = 'accepted';
        const alert = await this.alertController.create({
          header: '🎉 Offer Accepted!',
          message: `Welcome aboard, ${this.candidate.FirstName}! We're excited to have you join us. Our HR team will be in touch with the next steps.`,
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async (err) => {
        console.error('❌ Accept error:', err);
        this.acceptDisabled = false;
        this.rejectDisabled = false;
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Could not accept offer. Please try again or contact HR.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // ──────────────────────────────
  // Reject Offer
  // ──────────────────────────────
  async rejectOffer() {
    const confirmAlert = await this.alertController.create({
      header: 'Decline Offer',
      message: 'Are you sure you want to decline this offer? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes, Decline',
          role: 'destructive',
          handler: () => this.doReject()
        }
      ]
    });
    await confirmAlert.present();
  }

  private async doReject() {
    this.acceptDisabled = true;
    this.rejectDisabled = true;

    const candidateId = this.candidate?.candidate_id || this.candidate?.id;

    this.http.post<any>(`${this.apiBase}/${candidateId}/decline-offer`, { reason: 'Candidate declined via portal' }).subscribe({
      next: async () => {
        this.offerStatus = 'rejected';
        const alert = await this.alertController.create({
          header: 'Offer Declined',
          message: 'You have declined the offer. Thank you for your time and interest in Tech Tammina.',
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async (err) => {
        console.error('❌ Reject error:', err);
        this.acceptDisabled = false;
        this.rejectDisabled = false;
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Could not process your response. Please try again or contact HR.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
