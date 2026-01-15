import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KlienDTO {
  idKlien?: number;
  namaKlien: string;
  emailKlien: string;
  noTelp: string;
  status: 'BELUM' | 'AKTIF';
  tglRequest?: Date | string;
  approvedByManagers?: ManagerInfo[];
  lastApprovedBy?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ManagerInfo {
  idManager: number;
  namaManager: string;
  tglApprove?: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class KlienService {
  private apiUrl = `${environment.apiUrl}/admin/klien`;

  constructor(private http: HttpClient) {}

  getAllKlien(): Observable<ApiResponse<KlienDTO[]>> {
    return this.http.get<ApiResponse<KlienDTO[]>>(this.apiUrl);
  }

  getKlienById(id: number): Observable<ApiResponse<KlienDTO>> {
    return this.http.get<ApiResponse<KlienDTO>>(`${this.apiUrl}/${id}`);
  }

  createKlien(klien: KlienDTO): Observable<ApiResponse<KlienDTO>> {
    return this.http.post<ApiResponse<KlienDTO>>(this.apiUrl, klien);
  }

  updateKlien(id: number, klien: KlienDTO): Observable<ApiResponse<KlienDTO>> {
    return this.http.put<ApiResponse<KlienDTO>>(`${this.apiUrl}/${id}`, klien);
  }

  deleteKlien(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchKlien(keyword?: string, status?: string): Observable<ApiResponse<KlienDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<KlienDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  updateKlienStatus(id: number, status: string): Observable<ApiResponse<KlienDTO>> {
    return this.http.patch<ApiResponse<KlienDTO>>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}