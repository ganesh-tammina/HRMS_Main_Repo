import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AuthService } from '../Administration/services/auth-service.service';
import { _LoginService } from '../services/login-services.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  passwordUpdateForm!: FormGroup;
  forgotForm!: FormGroup;
  newEmployees!: FormGroup;
  existingEmpl!: FormGroup;

  showLoginForm = true;
  showPasswordUpdateForm = false;
  showForgotModal = false;

  loginError = '';
  forgotError = '';
  forgotSuccess = '';
  sending = false;
  loader = false;

  empType = '';
  new = false;
  old = false;

  adminData: any | null = null;
  allEmployees: any[] = [];
  one: any;

  private destroy$ = new Subject<void>();

  private readonly OTP_PATTERN = /^[0-9]{6}$/;
  private readonly PASSWORD_PATTERN = /^[A-Za-z0-9!@#$%^&*()_+]+$/;
  private readonly NEW_PASS_MIN = 8;
  private readonly EXISTING_PASS_MIN = 8;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private candidateservices: CandidateService,
    private authService: AuthService,
    private alertController: AlertController,
    private _loginSer: _LoginService,
    private _route_service: RouteGuardService
  ) {}

  /* ---------------------------
   * Lifecycle
   * --------------------------- */
  ngOnInit(): void {
    this.initForms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---------------------------
   * Form initialization
   * --------------------------- */
  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.newEmployees = this.fb.group(
      {
        otp: ['', [Validators.required, Validators.pattern(this.OTP_PATTERN)]],
        newPass: [
          '',
          [
            Validators.required,
            Validators.minLength(this.NEW_PASS_MIN),
            Validators.pattern(this.PASSWORD_PATTERN),
          ],
        ],
        confirmPass: [
          '',
          [
            Validators.required,
            Validators.minLength(this.NEW_PASS_MIN),
            Validators.pattern(this.PASSWORD_PATTERN),
          ],
        ],
      },
      { validators: this.passwordMatchValidator }
    );

    this.existingEmpl = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.EXISTING_PASS_MIN),
          Validators.pattern(this.PASSWORD_PATTERN),
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
  }

  /* ---------------------------
   * Validators & helpers
   * --------------------------- */
  passwordMatchValidator = (formGroup: FormGroup) => {
    const pass = formGroup.get('newPass')?.value;
    const confirm = formGroup.get('confirmPass')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  };

  get emailControl() {
    return this.loginForm.get('email');
  }
  get existingPasswordControl() {
    return this.existingEmpl.get('password');
  }

  /* ---------------------------
   * Login flow
   * --------------------------- */
  onLogin(): void {
    if (this.loginForm.invalid || this.existingEmpl.invalid) {
      this.loginForm.markAllAsTouched();
      this.existingEmpl.markAllAsTouched();
      return;
    }

    const body = {
      email: this.emailControl?.value,
      password: this.existingPasswordControl?.value,
    };

    this._loginSer
      .loginForAll(body)
      .pipe(
        finalize(() => this.newEmployees.reset()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (val: any) => {
          this.alertViewer('Information', val.message, 'OK');
          this._route_service.storeTokens(
            val.access_token!,
            val.refresh_token!,
            val.employee_id!,
            val.role!
          );

          const loginTime = new Date().toISOString();
          localStorage.setItem('login_time', loginTime);

          this.candidateservices
            .getEmpDet()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: any) => {
                this.allEmployees = response?.data ?? [];
                this.one = this.allEmployees.length
                  ? this.allEmployees[0]
                  : null;
                if (this.one) {
                  this.candidateservices.setCurrentEmployee(this.one);
                }
              },
              error: (err) => {
                console.error('Error fetching all employees:', err);
              },
            });

          this._route_service.redirectBasedOnRole(val.role);
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? err?.error ?? 'Login failed';
          if (err?.error?.message) {
            this.alertViewer('Error', msg, 'Try Again');
          } else {
            console.error(err);
            this.alertViewer('Error', String(msg), 'Cancel');
          }
        },
      });
  }

  async checkEmail(): Promise<void> {
    this.er = '';
    this.empType = '';
    this.new = false;
    this.old = false;

    if (!this.loginForm.valid) {
      if (this.emailControl?.hasError('required')) {
        this.er = 'Email is required.';
      } else if (this.emailControl?.hasError('email')) {
        this.er = 'Please enter a valid email address.';
      } else {
        this.er = 'Please enter a valid email address.';
      }
      return;
    }

    this.loader = true;
    const payload = { email: this.emailControl?.value };

    this._loginSer
      .checkEmail(payload)
      .pipe(
        finalize(() => (this.loader = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (val: any) => {
          this.er = '';
          this.empType = val.type;
          if (val.type === 'new_employee') {
            this.new = true;
            this.showLoginForm = false;
            this.newEmployees.reset();
            this.alertViewer('Information', val.message, 'OK');
          } else {
            this.old = true;
            this.showLoginForm = false;
            this.existingEmpl.reset();
          }
        },
        error: (err: any) => {
          const serverMsg = err?.error?.message;
          if (serverMsg && serverMsg.includes('must be a valid email')) {
            this.er = 'Please enter a valid email address.';
          } else {
            this.er = serverMsg ?? 'Failed to validate email.';
          }
        },
      });
  }

  /* ---------------------------
   * New employee password generation
   * --------------------------- */
  passwordGen(): void {
    if (this.newEmployees.invalid) {
      this.newEmployees.markAllAsTouched();
      return;
    }

    const body = {
      email: this.loginForm.controls['email'].value,
      otp: this.newEmployees.controls['otp'].value,
      newPassword: this.newEmployees.controls['confirmPass'].value,
    };

    this._loginSer
      .employeePasswordGeneration(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val: any) => {
          this.alertViewer('Information', val.message, 'OK');
          this.router.navigate(['/Home']);
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? 'Failed to generate password.';
          this.alertViewer('Error', msg, 'Try Again');
        },
        complete: () => {
          this.newEmployees.reset();
        },
      });
  }

  /* ---------------------------
   * Forgot password flow
   * --------------------------- */
  openForgotModal(): void {
    this.showForgotModal = true;
    this.forgotForm.reset();
    this.forgotError = '';
    this.forgotSuccess = '';
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  submitForgot(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const email = this.forgotForm.value.forgotEmail;
    this.sending = true;
    this.forgotError = '';
    this.forgotSuccess = '';

    this.candidateservices
      .getotp(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('✅ OTP sent successfully:', res);
          this.forgotSuccess = `OTP sent to ${email}.`;
          this.handleOtpSuccess(email);
        },
        error: (err: any) => {
          console.error('❌ Failed to send OTP:', err);
          this.sending = false;
          this.forgotError =
            err?.error?.message || 'Failed to send OTP. Try again later.';
        },
      });
  }

  private handleOtpSuccess(email: string): void {
    setTimeout(() => {
      this.sending = false;
      this.closeForgotModal();

      this.showLoginForm = false;
      this.showPasswordUpdateForm = true;
      this.passwordUpdateForm.patchValue({ email });
    }, 1000);
  }

  /* ---------------------------
   * Password update for existing users
   * --------------------------- */
  onPasswordUpdate(): void {
    if (this.passwordUpdateForm.invalid) {
      this.passwordUpdateForm.markAllAsTouched();
      return;
    }

    const { email, otp, newPassword } = this.passwordUpdateForm.value;

    this.candidateservices
      .changeoldEmpPassword(email, otp, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val: any) => {
          console.log('Pasword', val);
          this.alertViewer('Information', val.message, 'OK');
          this._route_service.storeTokens(
            val.access_token!,
            val.refresh_token!,
            val.employee_id!,
            val.role!
          );
          alert(val.role);
          this.handlePasswordSuccess();
          this._route_service.redirectBasedOnRole(val.role);
        },
        error: (err: any) => {
          console.error('❌ Password update failed:', err);
          const msg =
            err?.error?.message ??
            'Failed to update password. Check OTP and try again.';
          alert(msg);
        },
      });
  }

  private handlePasswordSuccess(): void {
    this.showPasswordUpdateForm = false;
    this.showLoginForm = true;
    this.passwordUpdateForm.reset();
  }

  /* ---------------------------
   * Alerts
   * --------------------------- */
  async alertViewer(
    header: string,
    message: string,
    buttons: string | string[]
  ) {
    const btns = Array.isArray(buttons) ? buttons : [buttons];
    const alert = await this.alertController.create({
      header,
      message,
      buttons: btns,
    });
    await alert.present();
  }

  er = '';
}
