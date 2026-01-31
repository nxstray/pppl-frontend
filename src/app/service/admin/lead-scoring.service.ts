import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeadAnalysisDTO {
  idRequest: number;
  namaKlien: string;
  emailKlien: string;
  perusahaan: string;
  layanan: string;
  skorPrioritas: string;
  kategoriLead: string;
  alasanSkor: string;
  statusRequest: string;
  tglRequest: Date;
  tglAnalisaAi: Date;
  aiAnalyzed: boolean;
}

export interface LeadStatistics {
  totalLeads: number;
  analyzedLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

export interface RateLimitInfo {
  maxRequests: number;
  remainingRequests: number;
  windowMinutes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class LeadScoringService {
  private apiUrl = `${environment.apiUrl}/admin/lead-scoring`;

  constructor(private http: HttpClient) {}

  // Get all leads untuk dashboard
  getAllLeads(): Observable<ApiResponse<LeadAnalysisDTO[]>> {
    return this.http.get<ApiResponse<LeadAnalysisDTO[]>>(`${this.apiUrl}/results`);
  }

  // Trigger AI analysis untuk 1 lead
  analyzeLeadById(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/analyze/${id}`, {});
  }

  // Trigger AI analysis untuk semua lead yang belum dianalisis
  analyzeAllPendingLeads(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/analyze-all`, {});
  }

  // Filter leads berdasarkan prioritas
  getLeadsByPriority(priority: string): Observable<ApiResponse<LeadAnalysisDTO[]>> {
    return this.http.get<ApiResponse<LeadAnalysisDTO[]>>(`${this.apiUrl}/results/priority/${priority}`);
  }

  // Get statistics untuk dashboard
  getLeadStatistics(): Observable<ApiResponse<LeadStatistics>> {
    return this.http.get<ApiResponse<LeadStatistics>>(`${this.apiUrl}/statistics`);
  }

  // Get rate limit info
  getRateLimitInfo(): Observable<ApiResponse<RateLimitInfo>> {
    return this.http.get<ApiResponse<RateLimitInfo>>(`${this.apiUrl}/rate-limit-info`);
  }
}