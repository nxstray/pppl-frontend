import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Login form
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  // Forgot password modal
  showForgotPasswordModal: boolean = false;
  forgotPasswordEmail: string = '';
  forgotPasswordError: string = '';
  forgotPasswordSuccess: string = '';
  isSendingResetLink: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.checkAndCleanExpiredToken();

    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username dan password harus diisi';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = response.message;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Username atau password salah';
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  clearError() {
    this.errorMessage = '';
  }

  // Forgot password methods
  openForgotPasswordModal() {
    this.showForgotPasswordModal = true;
    this.forgotPasswordEmail = '';
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
  }

  onForgotPasswordSubmit() {
    if (!this.forgotPasswordEmail || !this.forgotPasswordEmail.trim()) {
      this.forgotPasswordError = 'Email harus diisi';
      return;
    }

    if (!this.validateEmail(this.forgotPasswordEmail)) {
      this.forgotPasswordError = 'Format email tidak valid';
      return;
    }

    this.isSendingResetLink = true;
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';

    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (response) => {
        if (response.success) {
          this.forgotPasswordSuccess = response.message;
          this.forgotPasswordEmail = '';
        } else {
          this.forgotPasswordError = response.message;
        }
        this.isSendingResetLink = false;
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        this.forgotPasswordError = error.error?.message || 'Gagal mengirim link reset password';
        this.isSendingResetLink = false;
      }
    });
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}