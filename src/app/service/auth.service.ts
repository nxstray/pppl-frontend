import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
   * Check if user is logged in (with token existence check only)
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if token is valid (call backend to validate)
   */
  isTokenValid(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return of(false);
    }

    return this.validateToken().pipe(
      // Map ApiResponse<boolean> to boolean
      map(response => response.success && response.data === true),
      tap(isValid => {
        if (!isValid) {
          // Token invalid, clean up
          this.clearAuthData();
        }
      }),
      catchError(() => {
        // Error validating, assume invalid
        this.clearAuthData();
        return of(false);
      })
    );
  }

  /**
   * Check token validity synchronously (check expiration from JWT)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return true;
    }

    try {
      // Decode JWT payload (without verification, just parse)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      return now >= expiry;
    } catch (e) {
      // Invalid token format
      return true;
    }
  }

  /**
   * Clear authentication data - NEW
   */
  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /**
   * Check and clean expired token - NEW
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