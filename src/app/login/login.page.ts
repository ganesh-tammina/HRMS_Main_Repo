import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/login-services.service';
import { EmployeeService } from '../services/employee.service';
import { RouteGuardService } from '../services/route-guard/route-service/route-guard.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router,
    private routeGuardService: RouteGuardService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],   // email OR admin
      password: ['']
    });
  }

  /** 🔍 ADMIN CHECK */
  private isAdminLogin(value: string): boolean {
    return value === 'admin';
  }

  /** STEP 1 */
  onNext(): void {
    const value = this.loginForm.value.email;
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
    this.authService.checkEmployee(value).subscribe({
      next: (res) => {
        if (!res.found) {
          alert('Email not found in employee records');
          return;
        }

        this.emailChecked = true;

        if (res.hasUserAccount) {
          this.showPassword = true;
        } else {
          this.showCreatePassword = true;
        }

        this.loginForm.get('password')?.setValidators(Validators.required);
        this.loginForm.get('password')?.updateValueAndValidity();
      },
      error: () => alert('Failed to verify email')
    });
  }

  /** STEP 2 */
  onSubmit(): void {
    const { email, password } = this.loginForm.value;
    this.loading = true;

    /* 🔥 ADMIN LOGIN */
    if (this.isAdmin) {
      this.authService.login({ username: email, password }).subscribe({
        next: () => {
          this.loading = false;
          this.navigateBasedOnRole();
        },
        error: () => {
          this.loading = false;
          alert('Invalid admin credentials');
        }
      });
      return;
    }

    /* 🔹 EMPLOYEE LOGIN */
    if (this.showPassword) {
      this.authService.login({ username: email, password }).subscribe({
        next: () => this.loadEmployeeAndNavigate(),
        error: () => {
          this.loading = false;
          alert('Invalid credentials');
        }
      });
    }

    /* 🔹 CREATE PASSWORD */
    if (this.showCreatePassword) {
      this.authService.createUser(email, password).subscribe({
        next: () => {
          this.authService.login({ username: email, password }).subscribe({
            next: () => this.loadEmployeeAndNavigate(),
            error: () => {
              this.loading = false;
              alert('Auto login failed');
            }
          });
        },
        error: () => {
          this.loading = false;
          alert('Failed to create password');
        }
      });
    }
  }

  /** EMPLOYEE PROFILE */
  private loadEmployeeAndNavigate(): void {
    this.employeeService.getMyProfile(true).subscribe({
      next: () => {
        this.loading = false;
        this.navigateBasedOnRole();
      },
      error: () => {
        this.loading = false;
        alert('Failed to load employee profile');
      }
    });
  }

  /** NAVIGATE BASED ON USER ROLE */
  private navigateBasedOnRole(): void {
    const role = this.routeGuardService.userRole?.toLowerCase();

    if (role === 'admin') {
      this.router.navigate(['/admin'], { replaceUrl: true });
    } else {
      this.router.navigate(['/Home'], { replaceUrl: true });
    }
  }
}
