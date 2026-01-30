import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../auth/auth.service';

export interface RegisterManagerRequest {
  namaLengkap: string;
  email: string;
  noTelp: string;
  divisi: string;
}

export interface AdminDTO {
  idAdmin: number;
  username: string;
  namaLengkap: string;
  email: string;
  role: string;
  isActive: boolean;
  isFirstLogin: boolean;
  fotoProfil?: string;
  lastLogin?: Date;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Register manager baru
   */
  registerManager(
    request: RegisterManagerRequest
  ): Observable<ApiResponse<AdminDTO>> {
    return this.http.post<ApiResponse<AdminDTO>>(
      `${this.apiUrl}/register-manager`,
      request
    );
  }
}
