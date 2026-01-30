import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientFormDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idLayanan: number;
  message: string;
  perusahaan?: string;
  anggaran?: string;
  waktuImplementasi?: string;
}

export interface LayananOption {
  id: number;
  name: string;
  category: string;
}

export interface RequestSubmitResponse {
  idRequest: number;
  clientName: string;
  serviceName: string;
  isNewClient: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClientFormService {
  private apiUrl = `${environment.apiUrl}/public/form`;

  constructor(private http: HttpClient) {}

  /**
   * Submit client form
   */
  submitForm(formData: ClientFormDTO): Observable<ApiResponse<RequestSubmitResponse>> {
    return this.http.post<ApiResponse<RequestSubmitResponse>>(`${this.apiUrl}/submit`, formData);
  }

  /**
   * Get list layanan untuk dropdown
   */
  getLayananOptions(): Observable<ApiResponse<LayananOption[]>> {
    return this.http.get<ApiResponse<LayananOption[]>>(`${this.apiUrl}/layanan`);
  }
}