import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
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
export class LoginPage implements OnInit{
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
  one: any;
  allEmployees: any[] = [];
  // changes done by bipul
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private candidateService: CandidateService,
    private authService: AuthService,
    private alertController: AlertController,
    private _loginSer: _LoginService,
    private _route_service: RouteGuardService
  ) { }
 



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
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const pass = formGroup.get('newPass')?.value;
    const confirm = formGroup.get('confirmPass')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }
  onLogin() {
    const body = {
      email: this.loginForm.controls['email'].value,
      password: this.existingEmpl.controls['password'].value,
    };

    this._loginSer.loginForAll(body).subscribe({
      next: async (val) => {
        console.log('Login val', val);
        this.alertViewer('Information', val.message, 'OK');
        this._route_service.storeTokens(
          val.access_token!,
          val.refresh_token!,
          val.employee_id!,
          val.role!
        );
        
        // Store login time for "Since Last Login" calculation
        const loginTime = new Date().toISOString();
        localStorage.setItem('login_time', loginTime);
        console.log('🔑 Login time stored:', loginTime);

        this.candidateService.getEmpDet().subscribe({
          next: (response: any) => {
            if (response && response.data && response.data.length > 0) {
              this.allEmployees = response.data;
              this.one = response.data[0];
              console.log('login page', this.one);
              this.candidateService.setCurrentEmployee(this.one);
            } else {
              console.warn('No employee data found in response');
              this.allEmployees = [];
            }
          },
          error: (err) => {
            console.error('Error fetching employee details:', err);
            this.allEmployees = [];
            // Show user-friendly error if needed
            if (err.status === 401) {
              this.alertViewer('Error', 'Session expired. Please login again.', 'OK');
            } else if (err.status === 0) {
              this.alertViewer('Error', 'Network error. Please check your connection.', 'OK');
            }
          },
        });
        
        // Set flag to show login success popup on dashboard
        localStorage.setItem('showLoginSuccess', 'true');
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
            this.er = ''; // Clear any previous error message
            this.empType = val.type;
            this.loader = false;
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
          error: (err) => {
            this.loader = false;
            // Handle different error scenarios
            if (err.error && err.error.message) {
              if (err.error.message.includes('must be a valid email')) {
                this.er = 'Please enter a valid email address.';
              } else {
                this.er = err.error.message;
              }
            } else if (err.status === 0) {
              this.er = 'Network error. Please check your connection.';
            } else if (err.status === 500) {
              this.er = 'Server error. Please try again later.';
            } else {
              this.er = 'An unexpected error occurred. Please try again.';
            }
          },
          complete: () => {
            console.log(this.empType);
          },
        });
    } else {
      const emailControl = this.loginForm.get('email');
      if (emailControl?.hasError('required')) {
        this.er = 'Email is required.';
      } else if (emailControl?.hasError('email')) {
        this.er = 'Please enter a valid email address.';
      } else {
        this.er = 'Please enter a valid email address.';
      }
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

    // Send OTP for existing users
    this.candidateService.getotp(email).subscribe({
      next: (res) => {
        console.log('✅ OTP sent successfully:', res);
        this.forgotSuccess = `OTP sent to ${email}.`;
        this.handleOtpSuccess(email);
      },
      error: (err) => {
        console.error('❌ Failed to send OTP:', err);
        this.sending = false;
        this.forgotError = err.error?.message || 'Failed to send OTP. Try again later.';
      },
    });
  }

  private handleOtpSuccess(email: string) {
    setTimeout(() => {
      this.sending = false;
      this.closeForgotModal();
      // ?? Switch to password update form
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

    // Use the correct service for existing users
    this.candidateService
      .changeoldEmpPassword(email, otp, newPassword)
      .subscribe({
        next: (res) => {
          console.log('✅ Password updated successfully:', res);
          this.handlePasswordSuccess();
        },
        error: (err) => {
          console.error('❌ Password update failed:', err);
          alert(err.error?.message || 'Failed to update password. Check OTP and try again.');
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