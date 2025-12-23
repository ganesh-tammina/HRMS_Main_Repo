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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private employeeService: EmployeeService
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
          // Existing user
          this.showPassword = true;
          this.loginForm.get('password')?.setValidators(Validators.required);
        } else {
          // New user
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

    if (this.showPassword) {
      // LOGIN
      this.authService.login({ username: email, password }).subscribe({
        next: () => this.router.navigate(['/Home'], { replaceUrl: true }),
        error: () => alert('Invalid credentials')
      });
    }

    if (this.showCreatePassword) {
      // CREATE PASSWORD
      this.authService.createUser(email, password).subscribe({
        next: () => {
          // Auto login after creation
          this.authService.login({ username: email, password }).subscribe(() => {
            this.router.navigate(['/Home'], { replaceUrl: true });
          });
        },
        error: () => alert('Failed to create password')
      });
    }
  }
}
