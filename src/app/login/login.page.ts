import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/login-services.service'; // ✅ renamed import

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: '../login/login.Page.html',
  styleUrls: ['../login/login.Page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res?.token) {
          this.router.navigate(['/Home', { replaceUrl: true }]);
        } else {
          alert('Invalid credentials');
        }
        this.isLoading = false;
      },
      error: () => {
        alert('Login failed. Please try again.');
        this.isLoading = false;
      }
    });
  }
}
