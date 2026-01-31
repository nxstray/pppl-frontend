import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
  type: string;
  idAdmin: number;
  username: string;
  namaLengkap: string;
  email: string;
  role: string;
  fotoProfil?: string;
  isFirstLogin?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser: Observable<LoginResponse | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login
   */
  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Upload foto profil
   */
  uploadFotoProfil(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/upload-photo`, formData).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentUser = this.currentUserValue;
          if (currentUser) {
            currentUser.fotoProfil = response.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        }
      })
    );
  }

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Check token validity synchronously
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      
      return now >= expiry;
    } catch (e) {
      return true;
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /**
   * Check and clean expired token
   */
  checkAndCleanExpiredToken(): void {
    if (this.isTokenExpired()) {
      console.log('Token expired, cleaning up...');
      this.clearAuthData();
    }
  }

  /**
   * Get token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get current user info
   */
  getCurrentUser(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/me`);
  }

  /**
   * Validate token
   */
  validateToken(): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/validate`);
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Forgot password - Request reset link (NEW)
   */
  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, {
      email
    });
  }

  /**
   * Reset password with token (NEW)
   */
  resetPassword(token: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  /**
   * Check if user is admin or super admin
   */
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user ? ['SUPER_ADMIN', 'MANAGER'].includes(user.role) : false;
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  /**
   * Check if user is first login
   */
  isFirstLogin(): boolean {
    const user = this.currentUserValue;
    return user?.isFirstLogin ?? false;
  }
}