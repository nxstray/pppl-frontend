import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ManagerDTO {
  idManager?: number;
  namaManager: string;
  emailManager: string;
  noTelp: string;
  divisi: string;
  tglMulai: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = `${environment.apiUrl}/admin/manager`;

  constructor(private http: HttpClient) {}

  /**
   * Get all managers
   */
  getAllManagers(): Observable<ApiResponse<ManagerDTO[]>> {
    return this.http.get<ApiResponse<ManagerDTO[]>>(this.apiUrl);
  }

  /**
   * Get manager by ID
   */
  getManagerById(id: number): Observable<ApiResponse<ManagerDTO>> {
    return this.http.get<ApiResponse<ManagerDTO>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new manager
   */
  createManager(manager: ManagerDTO): Observable<ApiResponse<ManagerDTO>> {
    return this.http.post<ApiResponse<ManagerDTO>>(this.apiUrl, manager);
  }

  /**
   * Update manager
   */
  updateManager(id: number, manager: ManagerDTO): Observable<ApiResponse<ManagerDTO>> {
    return this.http.put<ApiResponse<ManagerDTO>>(`${this.apiUrl}/${id}`, manager);
  }

  /**
   * Delete manager
   */
  deleteManager(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search managers
   */
  searchManagers(keyword?: string, divisi?: string): Observable<ApiResponse<ManagerDTO[]>> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (divisi) params = params.set('divisi', divisi);
    
    return this.http.get<ApiResponse<ManagerDTO[]>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get divisi list
   */
  getDivisiList(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/divisi`);
  }

  /**
   * Get divisi list from layanan categories
   */
  getDivisiFromLayanan(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/divisi-layanan`);
  }
}