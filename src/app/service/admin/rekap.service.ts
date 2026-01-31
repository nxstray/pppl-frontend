import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RekapDTO {
  idMeeting?: number;
  idKlien: number;
  namaKlien?: string;
  namaManager?: string;
  namaManagerManual?: string;
  idLayanan: number;
  namaLayanan?: string;
  tglMeeting: Date | string;
  hasil?: string;
  status: 'MASIH_JALAN' | 'TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN';
  catatan?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class RekapService {
  private apiUrl = `${environment.apiUrl}/admin/rekap`;

  constructor(private http: HttpClient) {}

  getAllRekap(): Observable<ApiResponse<RekapDTO[]>> {
    return this.http.get<ApiResponse<RekapDTO[]>>(this.apiUrl);
  }

  getRekapById(id: number): Observable<ApiResponse<RekapDTO>> {
    return this.http.get<ApiResponse<RekapDTO>>(`${this.apiUrl}/${id}`);
  }

  createRekap(rekap: RekapDTO): Observable<ApiResponse<RekapDTO>> {
    return this.http.post<ApiResponse<RekapDTO>>(this.apiUrl, rekap);
  }

  updateRekap(id: number, rekap: RekapDTO): Observable<ApiResponse<RekapDTO>> {
    return this.http.put<ApiResponse<RekapDTO>>(`${this.apiUrl}/${id}`, rekap);
  }

  deleteRekap(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchRekap(keyword?: string, status?: string): Observable<ApiResponse<RekapDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<RekapDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  getRekapByKlien(idKlien: number): Observable<ApiResponse<RekapDTO[]>> {
    return this.http.get<ApiResponse<RekapDTO[]>>(`${this.apiUrl}/klien/${idKlien}`);
  }

  getRekapByManager(idManager: number): Observable<ApiResponse<RekapDTO[]>> {
    return this.http.get<ApiResponse<RekapDTO[]>>(`${this.apiUrl}/manager/${idManager}`);
  }
}