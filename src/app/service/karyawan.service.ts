import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KaryawanDTO {
  idKaryawan?: number;
  namaKaryawan: string;
  emailKaryawan: string;
  noTelp: string;
  jabatanPosisi: string;
  idManager: number;
  namaManager?: string;
  fotoProfil?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class KaryawanService {
  private apiUrl = `${environment.apiUrl}/admin/karyawan`;

  constructor(private http: HttpClient) {}

  getAllKaryawan(): Observable<ApiResponse<KaryawanDTO[]>> {
    return this.http.get<ApiResponse<KaryawanDTO[]>>(this.apiUrl);
  }

  getKaryawanById(id: number): Observable<ApiResponse<KaryawanDTO>> {
    return this.http.get<ApiResponse<KaryawanDTO>>(`${this.apiUrl}/${id}`);
  }

  createKaryawan(karyawan: KaryawanDTO): Observable<ApiResponse<KaryawanDTO>> {
    return this.http.post<ApiResponse<KaryawanDTO>>(this.apiUrl, karyawan);
  }

  updateKaryawan(id: number, karyawan: KaryawanDTO): Observable<ApiResponse<KaryawanDTO>> {
    return this.http.put<ApiResponse<KaryawanDTO>>(`${this.apiUrl}/${id}`, karyawan);
  }

  deleteKaryawan(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchKaryawan(keyword?: string, idManager?: number): Observable<ApiResponse<KaryawanDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (idManager) params = params.set('idManager', idManager.toString());
    return this.http.get<ApiResponse<KaryawanDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  getKaryawanByManager(idManager: number): Observable<ApiResponse<KaryawanDTO[]>> {
    return this.http.get<ApiResponse<KaryawanDTO[]>>(`${this.apiUrl}/manager/${idManager}`);
  }
}
