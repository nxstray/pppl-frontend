import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RequestLayananDTO {
  // Basic fields
  idRequest?: number;
  idLayanan: number;
  namaLayanan?: string;
  idKlien: number;
  namaKlien?: string;
  tglRequest?: Date | string;
  status: StatusRequest;
  tglVerifikasi?: Date | string;
  keteranganPenolakan?: string;
  approvedByManagerId?: number;
  approvedByName?: string;
  
  // Client details
  emailKlien?: string;
  noTelpKlien?: string;
  
  // Service details
  kategoriLayanan?: string;
  
  // Request details
  perusahaan?: string;
  topic?: string;
  pesan?: string;
  anggaran?: string;
  waktuImplementasi?: string;
  
  // AI Analysis
  aiAnalyzed?: boolean;
  skorPrioritas?: string;
  kategoriLead?: string;
  alasanSkor?: string;
  tglAnalisaAi?: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Alias for compatibility
export interface RequestDetailDTO extends RequestLayananDTO {}

export interface RequestStatistics {
  total: number;
  menungguVerifikasi: number;
  diverifikasi: number;
  ditolak: number;
}

export enum StatusRequest {
  MENUNGGU_VERIFIKASI = 'MENUNGGU_VERIFIKASI',
  VERIFIKASI = 'VERIFIKASI',
  DITOLAK = 'DITOLAK'
}

@Injectable({
  providedIn: 'root'
})
export class RequestLayananService {
  private apiUrl = `${environment.apiUrl}/admin/request-layanan`;

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<ApiResponse<RequestLayananDTO[]>> {
    return this.http.get<ApiResponse<RequestLayananDTO[]>>(this.apiUrl);
  }

  getRequestById(id: number): Observable<ApiResponse<RequestDetailDTO>> {
    return this.http.get<ApiResponse<RequestDetailDTO>>(`${this.apiUrl}/${id}`);
  }

  getRequestsByStatus(status: string): Observable<ApiResponse<RequestLayananDTO[]>> {
    return this.http.get<ApiResponse<RequestLayananDTO[]>>(`${this.apiUrl}/status/${status}`);
  }

  approveRequest(id: number): Observable<ApiResponse<RequestLayananDTO>> {
    return this.http.post<ApiResponse<RequestLayananDTO>>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number, keterangan: string): Observable<ApiResponse<RequestLayananDTO>> {
    return this.http.post<ApiResponse<RequestLayananDTO>>(`${this.apiUrl}/${id}/reject`, { keterangan });
  }

  getStatistics(): Observable<ApiResponse<RequestStatistics>> {
    return this.http.get<ApiResponse<RequestStatistics>>(`${this.apiUrl}/statistics`);
  }
}