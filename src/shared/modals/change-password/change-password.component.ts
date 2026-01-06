import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
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
          alert('Password berhasil diubah. Silakan login kembali dengan password baru Anda.');
          this.authService.logout();
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