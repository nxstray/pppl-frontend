import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Generic API Response Interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Data Interfaces
 */
export interface MonthlyLeadStats {
  data: MonthData[];
}

export interface MonthData {
  month: string;
  hot: number;
  warm: number;
  cold: number;
  unscored: number;
}

export interface LeadTrendStats {
  data: TrendData[];
}

export interface TrendData {
  month: string;
  count: number;
  growthRate: number;
}

export interface ConversionStats {
  data: ConversionData[];
}

export interface ConversionData {
  month: string;
  total: number;
  verified: number;
  rejected: number;
  pending: number;
  conversionRate: number;
}

export interface ActivityResponse {
  skorPrioritas: 'HOT' | 'WARM' | 'COLD' | null;
  description: string;
  tglAnalisaAi: Date;
}

/**
 * Dashboard Service
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private http: HttpClient) {}

  /**
   * Load ALL dashboard data concurrently
   */
  loadDashboard() {
    return forkJoin({
      monthly: this.http.get<ApiResponse<MonthlyLeadStats>>(
        `${environment.apiUrl}/admin/dashboard/monthly-lead-stats?months=6`
      ),

      trend: this.http.get<ApiResponse<LeadTrendStats>>(
        `${environment.apiUrl}/admin/dashboard/lead-trend?months=6`
      ),

      conversion: this.http.get<ApiResponse<ConversionStats>>(
        `${environment.apiUrl}/admin/dashboard/conversion-rate?months=6`
      ),

      activities: this.http.get<ApiResponse<ActivityResponse[]>>(
        `${environment.apiUrl}/admin/dashboard/recent-activities?limit=5`
      ),

      leadStats: this.http.get<any>(
        `${environment.apiUrl}/admin/lead-scoring/statistics`
      ),

      klien: this.http.get<any>(
        `${environment.apiUrl}/admin/klien`
      ),

      karyawan: this.http.get<any>(
        `${environment.apiUrl}/admin/karyawan`
      ),

      pending: this.http.get<any>(
        `${environment.apiUrl}/admin/request-layanan/status/MENUNGGU_VERIFIKASI`
      )
    });
  }

  /**
   * Load chart by type
   */
  loadChart(
    type: 'monthly' | 'trend' | 'conversion'
  ): Observable<ApiResponse<any>> {

    const endpointMap = {
      monthly: '/admin/dashboard/monthly-lead-stats?months=6',
      trend: '/admin/dashboard/lead-trend?months=6',
      conversion: '/admin/dashboard/conversion-rate?months=6'
    };

    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}${endpointMap[type]}`
    );
  }
}
