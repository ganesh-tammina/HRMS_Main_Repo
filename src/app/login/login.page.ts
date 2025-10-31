import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CandidateService } from 'src/app/services/pre-onboarding.service';
import {
  AuthService,
  LoggedUser,
} from '../Administration/services/auth-service.service';
import { _LoginService } from '../services/login-services.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
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

  // changes done by bipul
  empType: string = '';
  new: boolean = false;
  old: boolean = false;
  er!: string;
  loader: boolean = false;
  newEmployees!: FormGroup;
  existingEmpl!: FormGroup;
  // changes done by bipul
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private candidateService: CandidateService,
    private authService: AuthService,
    private alertController: AlertController,
    private _loginSer: _LoginService,
    private _route_service: RouteGuardService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.newEmployees = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
        newPass: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^[A-Za-z0-9!@#$%^&*()_+]+$/),
          ],
        ],
        confirmPass: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^[A-Za-z0-9!@#$%^&*()_+]+$/),
          ],
        ],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.existingEmpl = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^[A-Za-z0-9!@#$%^&*()_+]+$/),
        ],
      ],
    });
    this.passwordUpdateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotForm = this.fb.group({
      forgotEmail: ['', [Validators.required, Validators.email]],
    });

    this.candidateService.getAdminById('1').subscribe((data) => {
      this.adminData = data;
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const pass = formGroup.get('newPass')?.value;
    const confirm = formGroup.get('confirmPass')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }
  onLogin() {
    const body = {
      password: this.existingEmpl.controls['password'].value,
    };

    this._loginSer.loginForAll(body).subscribe({
      next: async (val) => {
        console.log('Login val', val);
        this.alertViewer('Information', val.message, 'OK');
        this._route_service.login(val.token!, val.role!);
        this._route_service.redirectBasedOnRole(val.role);
      },
      error: (err) => {
        if (err.error.message) {
          this.alertViewer('Error', err.error.message, 'Try Again');
        } else {
          console.log(err);
          this.alertViewer('Error', err.error, 'Cancel');
        }
      },
      complete: () => {
        this.newEmployees.reset();
      },
    });
  }
  async checkEmail() {
    if (this.loginForm.valid) {
      this.loader = true;
      this._loginSer
        .checkEmail({
          email: this.loginForm.controls['email'].value,
        })
        .subscribe({
          next: (val) => {
            this.empType = val.type;
            this.loader = false;
            if (val.type === 'new_employee') {
              this.new = true;
              this.showLoginForm = false;
              this.alertViewer('Information', val.message, 'OK');
            } else {
              this.old = true;
              this.showLoginForm = false;
            }
          },
          error: (err) => {
            this.er = err.error.message;
          },
          complete: () => {
            this.loginForm.reset();
            console.log(this.empType);
          },
        });
    } else {
      this.er = 'Invalid Email';
    }
  }
  async passwordGen() {
    if (this.newEmployees.valid) {
      const body = {
        otp: this.newEmployees.controls['otp'].value,
        newPassword: this.newEmployees.controls['confirmPass'].value,
      };
      this._loginSer.employeePasswordGeneration(body).subscribe({
        next: (val) => {
          this.alertViewer('Information', val.message, 'OK');
          this.router.navigate(['/Home']);
        },
        error: (err) => {
          this.alertViewer('Error', err.error.message, 'Try Again');
        },
        complete: () => {
          this.newEmployees.reset();
        },
      });
    }
  }
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
          },
        });
      },
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
    this.candidateService
      .verifyAndResetPassword(email, otp, newPassword)
      .subscribe({
        next: () => {
          this.handlePasswordSuccess();
        },
        error: (err) => {
          console.warn(
            '⚠️ verifyAndResetPassword failed, trying changeoldEmpPassword...',
            err
          );

          // 🔄 fallback → old user flow
          this.candidateService
            .changeoldEmpPassword(email, otp, newPassword)
            .subscribe({
              next: () => {
                this.handlePasswordSuccess();
              },
              error: (err2) => {
                console.error('❌ Both password update methods failed:', err2);
                alert('Failed to update password. Check OTP and try again.');
              },
            });
        },
      });
  }

  private handlePasswordSuccess() {
    alert('Password updated successfully!');
    this.showPasswordUpdateForm = false;
    this.showLoginForm = true;
    this.passwordUpdateForm.reset();
  }

  async alertViewer(header: string, message: string, buttons: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [buttons],
    });
    alert.present();
  }
}
