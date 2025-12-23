import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/login-services.service';
import { EmployeeService } from '../services/employee.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['']
    });
  }

  /** STEP 1 – CHECK EMAIL */
  onNext(): void {
    const email = this.loginForm.value.email;

    this.authService.checkEmployee(email).subscribe({
      next: (res) => {
        if (!res.found) {
          alert('Email not found in employee records');
          return;
        }

        this.emailChecked = true;

        if (res.hasUserAccount) {
          this.showPassword = true;
          this.loginForm.get('password')?.setValidators(Validators.required);
        } else {
          this.showCreatePassword = true;
          this.loginForm.get('password')?.setValidators(Validators.required);
        }

        this.loginForm.get('password')?.updateValueAndValidity();
      },
      error: () => alert('Failed to verify email')
    });
  }

  /** STEP 2 – LOGIN OR CREATE PASSWORD */
  onSubmit(): void {
    const { email, password } = this.loginForm.value;
    this.loading = true;

    // 🔹 EXISTING USER LOGIN
    if (this.showPassword) {
      this.authService.login({ username: email, password }).subscribe({
        next: () => this.loadEmployeeAndNavigate(),
        error: () => {
          this.loading = false;
          alert('Invalid credentials');
        }
      });
    }

    // 🔹 CREATE PASSWORD & AUTO LOGIN
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

  /** 🔥 LOAD EMPLOYEE PROFILE AFTER LOGIN */
  private loadEmployeeAndNavigate(): void {
    this.employeeService.getMyProfile(true).subscribe({
      next: (res) => {
        console.log('Employee Profile:', res);
        this.loading = false;
        this.router.navigate(['/Home'], { replaceUrl: true });
      },
      error: () => {
        this.loading = false;
        alert('Failed to load employee profile');
      }
    });
  }
}
