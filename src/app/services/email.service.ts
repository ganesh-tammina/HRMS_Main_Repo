import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class EmailService {
	private beURL = 'http://localhost:3562/send-email';

	constructor(private http: HttpClient) { }

	sendEmail(candidate: any): Observable<any> {
		console.log('Preparing to send email to candidate:', candidate);
		const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        <p>Hello ${candidate.FirstName},</p>
        <p>We’re thrilled to welcome you as <b>${candidate.JobTitle}</b> at Tech Tammina!</p>
        <p>Please review your offer letter and confirm by <b>${candidate.JoiningDate}</b>.</p>
        <a href="http://localhost:4200/candidate_status/${candidate.id}" 
           style="background-color:#3498db;color:white;padding:10px 16px;text-decoration:none;border-radius:5px">
           View Offer
        </a>
        <p>Best Regards,<br/>Tech Tammina Hiring Team</p>
      </body>
      </html>
    `;

		const data = {
			to: candidate.Email,
			subject: `Welcome to Tech Tammina, ${candidate.FirstName}!`,
			text: `Welcome ${candidate.FirstName}, please check your offer letter.`,
			html: htmlTemplate
		};

		return this.http.post<any>(this.beURL, data).pipe(
			tap((response) => {
				if (!response.success) {
					alert('❌ Failed to send email. Please try again.');
				}
			})
		);
	}
}
