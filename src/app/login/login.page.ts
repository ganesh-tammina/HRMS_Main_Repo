import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/login-services.service';
import { EmployeeService } from '../services/employee.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';
import { AdminSetup } from '../services/admin-setup.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.Page.html',
  styleUrls: ['./login.Page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;

  emailChecked = false;
  showPassword = false;
  showCreatePassword = false;
  loading = false;
  isAdmin = false;
  isEmpId = false;
  empId: number | null = null;
  rolePreviewData: any = null;
  showForgotPassword = false;
  forgotPasswordForm!: FormGroup;
  forgotPasswordSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router,
    private routeGuardService: RouteGuardService,
    private adminSetup: AdminSetup,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],   // email OR admin
      password: ['']
    });

    this.forgotPasswordForm = this.fb.group({
      employee_id: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ionViewWillEnter(): void {
    this.ngOnInit();
  }

  /** 🔍 ADMIN CHECK */
  private isAdminLogin(value: string): boolean {
    return value === 'admin';
  }

  /** STEP 1 */
  onNext(): void {
    let value = this.loginForm.value.email;
    if (value) {
      value = value.trim().toLowerCase();
      this.loginForm.get('email')?.setValue(value);
    }
    this.isAdmin = this.isAdminLogin(value);

    /* 🔥 ADMIN FLOW */
    if (this.isAdmin) {
      this.emailChecked = true;
      this.showPassword = true;
      this.loginForm.get('password')?.setValidators(Validators.required);
      this.loginForm.get('password')?.updateValueAndValidity();
      return;
    }

    /* 🔹 EMPLOYEE FLOW */
    this.isEmpId = /^\d+$/.test(value);

    // If it's a numeric ID, we still want to check if it exists
    this.authService.checkEmployee(value).subscribe({
      next: (res) => {
        if (!res.found) {
          this.presentToast('Employee not found', 'warning');
          return;
        }

        // Store the numeric ID from response if available
        if (res.employee?.id) {
          this.empId = res.employee.id;
        } else if (this.isEmpId) {
          this.empId = parseInt(value);
        }

        // Check if employee has team/reporting members
        this.authService.previewRole(value).subscribe({
          next: (roleRes) => {
            console.log('Employee role preview:', roleRes);
            this.rolePreviewData = roleRes;
            // Store role information if needed
            if (roleRes.hasTeam || roleRes.reportingMembers?.length > 0) {
              console.log('Employee has team members:', roleRes);
              sessionStorage.setItem('hasTeam', 'true');
              sessionStorage.setItem('rolePreview', JSON.stringify(roleRes));
            }
          },
          error: (err) => console.warn('Failed to fetch role preview:', err)
        });

        this.emailChecked = true;

        if (res.hasUserAccount) {
          this.showPassword = true;
        } else {
          this.showCreatePassword = true;
        }

        this.loginForm.get('password')?.setValidators(Validators.required);
        this.loginForm.get('password')?.updateValueAndValidity();
      },
      error: () => this.presentToast('Failed to verify employee', 'danger')
    });
  }

  /** STEP 2 */
  onSubmit(): void {
    let { email, password } = this.loginForm.value;
    if (email) {
      email = email.trim().toLowerCase();
      this.loginForm.get('email')?.setValue(email);
    }
    // this.loading = true;

    /* 🔥 ADMIN LOGIN */
    if (this.isAdmin) {
      this.authService.login({ username: email, password }).subscribe({
        next: () => {
          this.loading = false;
          this.navigateBasedOnRole();
        },
        error: () => {
          this.loading = false;
          this.presentToast('Invalid admin credentials', 'danger');
        }
      });
      return;
    }

    /* 🔹 EMPLOYEE LOGIN (Create-Auto / Normal) */
    if (this.showPassword || this.showCreatePassword) {
      this.loading = true;

      if (this.empId) {
        // Trigger autoCreateUser to ensure role mapping as requested
        this.authService.autoCreateUser(this.empId, password).subscribe({
          next: () => this.loadEmployeeAndNavigate(),
          error: (err) => {
            console.warn('create-auto failed or user exists:', err);
            const errorMsg = err.error?.error || err.error?.message || "";

            // If user already exists, fall back to normal login
            if (err.status === 400 || errorMsg.toLowerCase().includes('already exists')) {
              this.authService.login({ username: email, password }).subscribe({
                next: () => this.loadEmployeeAndNavigate(),
                error: (loginErr) => {
                  this.loading = false;
                  this.presentToast('Invalid credentials', 'danger');
                }
              });
            } else {
              this.loading = false;
              this.presentToast('Login failed', 'danger');
            }
          }
        });
      } else {
        // Email-based flow without numeric ID
        const loginAction = this.showPassword
          ? this.authService.login({ username: email, password })
          : this.authService.createUser(email, password);

        loginAction.subscribe({
          next: () => this.loadEmployeeAndNavigate(),
          error: () => {
            this.loading = false;
            this.presentToast('Login failed', 'danger');
          }
        });
      }
    }
  }

  /** FORGOT PASSWORD SUBMIT */
  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;
    this.loading = true;
    const { employee_id, password } = this.forgotPasswordForm.value;
    const token = '';
    this.authService.createPassword(employee_id, password, token).subscribe({
      next: () => {
        this.loading = false;
        this.forgotPasswordSuccess = true;
        this.showForgotPassword = false;
        this.presentToast('Password reset successful! Logging you in...', 'success');
        // Auto-login after password reset
        this.authService.login({ username: employee_id, password }).subscribe({
          next: () => this.loadEmployeeAndNavigate(),
          error: () => {
            this.loading = false;
            this.presentToast('Password reset, but auto-login failed. Please login manually.', 'warning');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.presentToast('Failed to reset password.', 'danger');
      }
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  /** SHOW FORGOT PASSWORD FORM */
  showForgotPasswordForm(): void {
    this.showForgotPassword = true;
    this.forgotPasswordSuccess = false;
    this.forgotPasswordForm.reset();
  }

  /** HIDE FORGOT PASSWORD FORM */
  hideForgotPasswordForm(): void {
    this.showForgotPassword = false;
  }

  /** EMPLOYEE PROFILE */
  private loadEmployeeAndNavigate(): void {
    this.employeeService.getMyProfile(true).subscribe({
      next: () => {
        // Auto-assign role based on employee data
        this.autoAssignRole();
      },
      error: () => {
        this.loading = false;
        this.presentToast('Failed to load employee profile', 'danger');
      }
    });
  }

  /** AUTO-ASSIGN ROLE (HR/Manager/Employee) */
  private autoAssignRole(): void {
    console.log('🔄 Starting auto-assign role process...');

    this.adminSetup.autoAssignRole().subscribe({
      next: (response) => {
        console.log('📊 Role assignment result:', response);

        if (response.changed) {
          console.log(`✅ Role auto-assigned: ${response.previousRole} → ${response.newRole}`);
          console.log(`📋 Reason: ${response.reason}`);

          // Show notification to user
          this.presentToast(`Your role has been updated to: ${response.newRole.toUpperCase()}\nReason: ${response.reason}`, 'primary');

          // Update the token with new role
          this.refreshTokenAndNavigate();
        } else {
          console.log(`ℹ️ Role unchanged: ${response.role}`);
          this.loading = false;
          this.navigateBasedOnRole();
        }
      },
      error: (err) => {
        console.error('❌ Auto-assign role failed:', err);
        console.error('Error details:', err.error || err.message);

        // Continue with current role even if auto-assign fails
        this.loading = false;
        this.navigateBasedOnRole();
      }
    });
  }

  /** REFRESH TOKEN AFTER ROLE CHANGE */
  private refreshTokenAndNavigate(): void {
    const { email, password } = this.loginForm.value;

    // Re-authenticate to get new token with updated role
    this.authService.login({ username: email, password }).subscribe({
      next: (response) => {
        console.log('✅ Token refreshed with new role:', response?.user?.role);
        this.loading = false;

        // Force reload route guard service role
        window.location.reload();
      },
      error: (err) => {
        console.error('❌ Token refresh failed:', err);
        // Even if refresh fails, try to navigate with existing token
        this.loading = false;
        this.navigateBasedOnRole();
      }
    });
  }

  /** NAVIGATE BASED ON USER ROLE */
  private navigateBasedOnRole(): void {
    const role = this.routeGuardService.userRole?.toLowerCase();

    if (role === 'admin') {
      this.router.navigate(['/admin'], { replaceUrl: true });
    } else {
      // Show welcome popup for employees before navigation
      // this.showWelcomePopup();
      this.router.navigate(['/Home'], { replaceUrl: true });
    }
  }

  /** SHOW WELCOME POPUP WITH EMPLOYEE DETAILS */
  private showWelcomePopup(): void {
    const employee = this.employeeService.getCurrentEmployee();
    const roleData = this.rolePreviewData;

    if (employee) {
      const name = `${employee.FirstName || ''} ${employee.LastName || ''}`;
      const department = employee.Department || 'Not Assigned';

      // Determine if employee is a Manager based on having reporting members
      const isManager = roleData?.hasTeam || (roleData?.reportingMembers && roleData.reportingMembers.length > 0);
      const role = isManager ? 'Manager' : (employee.Role || 'Employee');
      const teamInfo = isManager ? `\n👥 Team Members: ${roleData.reportingMembers?.length || 0}` : '';

      const message = `
🎉 Welcome Back!

👤 Name: ${name}
💼 Role: ${role}${teamInfo}
🏢 Department: ${department}
      `;

      alert(message.trim());
    }
  }

  /** LOGOUT */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.loginForm.reset(); // Reset the form to clear all fields
        this.emailChecked = false; // Reset admin flow state
        this.showPassword = false; // Hide password field
        this.router.navigate(['/login']); // Navigate to login page
      },
      error: (err) => {
        console.error('Logout failed:', err);
      }
    });
  }

  /** HANDLE ENTER KEY PRESS */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.emailChecked && !this.showForgotPassword) {
      this.onNext();
    }
  }
}
