import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import { AuthService, LoggedUser } from '../Administration/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  passwordUpdateForm!: FormGroup;
  forgotForm!: FormGroup;

  showLoginForm = true;
  showPasswordUpdateForm = false;
  showForgotModal = false;

  loginError = '';
  forgotError = '';
  forgotSuccess = '';
  sending = false;
  adminData: any | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private candidateService: CandidateService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.passwordUpdateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotForm = this.fb.group({
      forgotEmail: ['', [Validators.required, Validators.email]],
    });

    this.candidateService.getAdminById('1').subscribe(data => {
      this.adminData = data;
    });
  }

  onLogin() {
    const { email, password } = this.loginForm.value;

    if (email === this.adminData?.username && password === this.adminData?.password) {
      const user: LoggedUser = { type: 'admin', data: { UserName: 'admin' } };
      this.authService.setUser(user);
      this.router.navigate(['/admin']);
      return;
    }

    this.candidateService.findEmployee(email, password).subscribe(
      found => {
        if (found) {
          const user: LoggedUser = { type: 'employee', data: found };
          this.authService.setUser(user);
          this.router.navigate(['/Home']);
        } else {
          this.loginError = 'Invalid email or password';
        }
      },
      err => {
        console.error(err);
        this.loginError = 'Login failed. Please try again later.';
      }
    );
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Open the forgot password modal and reset the form fields and error messages.
   */
  /*******  b8cacb47-3b03-4280-91f6-2088464364fc  *******/
  openForgotModal() {
    this.showForgotModal = true;
    this.forgotForm.reset();
    this.forgotError = '';
    this.forgotSuccess = '';
  }

  closeForgotModal() {
    this.showForgotModal = false;
  }

  submitForgot() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const email = this.forgotForm.value.forgotEmail;
    this.sending = true;
    this.forgotError = '';
    this.forgotSuccess = '';

    // ✅ First check if email already exists (old user)
    this.candidateService.getotp(email).subscribe({
      next: (res) => {
        console.log('✅ Old email OTP sent:', res);
        this.forgotSuccess = `OTP sent to ${email}.`;
        this.handleOtpSuccess(email);
      },
      error: (err) => {
        console.warn('⚠️ getotp failed, trying newpasswordCreation...', err);

        // If getotp fails → assume new email → call newpasswordCreation
        this.candidateService.newpasswordCreation(email).subscribe({
          next: (res) => {
            console.log('✅ New email OTP sent:', res);
            this.forgotSuccess = `OTP sent to ${email}.`;
            this.handleOtpSuccess(email);
          },
          error: (err2) => {
            console.error('❌ Both OTP methods failed:', err2);
            this.sending = false;
            this.forgotError = 'Failed to send OTP. Try again later.';
          }
        });
      }
    });
  }

  private handleOtpSuccess(email: string) {
    setTimeout(() => {
      this.sending = false;
      this.closeForgotModal();
      // 🔥 Switch to password update form
      this.showLoginForm = false;
      this.showPasswordUpdateForm = true;
      this.passwordUpdateForm.patchValue({ email });
    }, 2000);
  }



  onPasswordUpdate() {
    if (this.passwordUpdateForm.invalid) {
      this.passwordUpdateForm.markAllAsTouched();
      return;
    }

    const { email, otp, newPassword } = this.passwordUpdateForm.value;

    // ✅ First try new-user flow
    this.candidateService.verifyAndResetPassword(email, otp, newPassword).subscribe({
      next: () => {
        this.handlePasswordSuccess();
      },
      error: (err) => {
        console.warn("⚠️ verifyAndResetPassword failed, trying changeoldEmpPassword...", err);

        // 🔄 fallback → old user flow
        this.candidateService.changeoldEmpPassword(email, otp, newPassword).subscribe({
          next: () => {
            this.handlePasswordSuccess();
          },
          error: (err2) => {
            console.error("❌ Both password update methods failed:", err2);
            alert("Failed to update password. Check OTP and try again.");
          }
        });
      }
    });
  }

  private handlePasswordSuccess() {
    alert("Password updated successfully!");
    this.showPasswordUpdateForm = false;
    this.showLoginForm = true;
    this.passwordUpdateForm.reset();
  }




}
