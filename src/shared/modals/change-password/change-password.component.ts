import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../app/service/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnDestroy {
  @Input() isFirstLogin = false;
  @Output() close = new EventEmitter<void>();

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  isLoading = false;
  errorMessage = '';
  
  // Success modal
  showSuccessModal = false;
  countdown = 7;
  countdownInterval: any;
  
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  /**
   * Validate password requirements
   */
  onPasswordInput(): void {
    this.passwordRequirements.minLength = this.newPassword.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(this.newPassword);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(this.newPassword);
    this.passwordRequirements.hasNumber = /\d/.test(this.newPassword);
    this.passwordRequirements.hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.newPassword);
    
    this.errorMessage = '';
  }

  /**
   * Check if all requirements are met
   */
  get allRequirementsMet(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    // Validation
    if (!this.isFirstLogin && !this.oldPassword) {
      this.errorMessage = 'Password lama harus diisi';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'Password baru harus diisi';
      return;
    }

    if (!this.allRequirementsMet) {
      this.errorMessage = 'Password baru tidak memenuhi persyaratan';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Konfirmasi password tidak sesuai';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.changePassword(
      this.isFirstLogin ? '' : this.oldPassword,
      this.newPassword
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.isLoading = false;
          this.showSuccessModal = true;
          this.startCountdown();
        } else {
          this.errorMessage = response.message;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Change password error:', error);
        this.errorMessage = error.error?.message || 'Gagal mengubah password';
        this.isLoading = false;
      }
    });
  }

  /**
   * Start countdown timer
   */
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.redirectToLogin();
      }
    }, 1000);
  }

  /**
   * Redirect to login page
   */
  redirectToLogin(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.authService.logout();
  }

  /**
   * Manual redirect (ketika user klik tombol)
   */
  onLoginNow(): void {
    this.redirectToLogin();
  }

  /**
   * Close modal
   */
  onClose(): void {
    if (!this.isFirstLogin) {
      this.close.emit();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword(field: 'old' | 'new' | 'confirm'): void {
    if (field === 'old') this.showOldPassword = !this.showOldPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }
}