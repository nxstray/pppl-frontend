import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-reset-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-page.component.html',
  styleUrls: ['./reset-page.component.scss']
})
export class ResetPageComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  invalidToken: boolean = false;
  
  passwordRequirements = {
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.invalidToken = true;
        this.errorMessage = 'Token reset password tidak valid atau sudah kadaluarsa';
      }
    });
  }

  onPasswordInput() {
    this.passwordRequirements.minLength = this.newPassword.length >= 8;
    this.passwordRequirements.hasUppercase = /[A-Z]/.test(this.newPassword);
    this.passwordRequirements.hasLowercase = /[a-z]/.test(this.newPassword);
    this.passwordRequirements.hasNumber = /\d/.test(this.newPassword);
    this.passwordRequirements.hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.newPassword);
    
    this.errorMessage = '';
  }

  get allRequirementsMet(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  togglePasswordVisibility(field: 'new' | 'confirm') {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    if (this.invalidToken) {
      return;
    }

    if (!this.newPassword) {
      this.errorMessage = 'Password baru harus diisi';
      return;
    }

    if (!this.allRequirementsMet) {
      this.errorMessage = 'Password tidak memenuhi persyaratan';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Konfirmasi password tidak sesuai';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Reset password error:', error);
        this.errorMessage = error.error?.message || 'Gagal reset password. Token mungkin sudah kadaluarsa.';
        this.isLoading = false;
      }
    });
  }

  clearError() {
    this.errorMessage = '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}