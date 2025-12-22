import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LayananDTO {
  idLayanan?: number;
  namaLayanan: string;
  kategori: 'SOSIAL' | 'PIRANTI_LUNAK' | 'MULTIMEDIA' | 'MESIN_SEKURITAS';
  catatan?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayananService {
  private apiUrl = `${environment.apiUrl}/admin/layanan`;

  constructor(private http: HttpClient) {}

  getAllLayanan(): Observable<ApiResponse<LayananDTO[]>> {
    return this.http.get<ApiResponse<LayananDTO[]>>(this.apiUrl);
  }

  getLayananById(id: number): Observable<ApiResponse<LayananDTO>> {
    return this.http.get<ApiResponse<LayananDTO>>(`${this.apiUrl}/${id}`);
  }

  createLayanan(layanan: LayananDTO): Observable<ApiResponse<LayananDTO>> {
    return this.http.post<ApiResponse<LayananDTO>>(this.apiUrl, layanan);
  }

  updateLayanan(id: number, layanan: LayananDTO): Observable<ApiResponse<LayananDTO>> {
    return this.http.put<ApiResponse<LayananDTO>>(`${this.apiUrl}/${id}`, layanan);
  }

  deleteLayanan(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  searchLayanan(keyword?: string, kategori?: string): Observable<ApiResponse<LayananDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (kategori) params = params.set('kategori', kategori);
    return this.http.get<ApiResponse<LayananDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  getLayananByKategori(kategori: string): Observable<ApiResponse<LayananDTO[]>> {
    return this.http.get<ApiResponse<LayananDTO[]>>(`${this.apiUrl}/kategori/${kategori}`);
  }
}