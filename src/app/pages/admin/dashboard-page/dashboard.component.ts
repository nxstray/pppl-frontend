import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  DashboardService,
  ActivityResponse,
  MonthData,
  TrendData,
  ConversionData
} from '../../../service/dashboard.service';

import { MonthlyLeadChartComponent } from '../../../../shared/charts/monthly-lead/monthly-lead.component';
import { LeadTrendChartComponent } from '../../../../shared/charts/lead-trend/lead-trend.component';
import { ConversionChartComponent } from '../../../../shared/charts/conversion-chart/conversion-chart.component';

/* =====================
   UI MODELS
===================== */
interface StatCard {
  title: string;
  value: number;
  trend?: number;
  route?: string;
}

interface Activity {
  icon: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'primary';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MonthlyLeadChartComponent,
    LeadTrendChartComponent,
    ConversionChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loading = true;

  stats: StatCard[] = [
    { title: 'Total Klien', value: 0, route: '/admin/klien' },
    { title: 'Hot Leads', value: 0, route: '/admin/lead-scoring' },
    { title: 'Request Pending', value: 0, route: '/admin/request-layanan' },
    { title: 'Total Karyawan', value: 0, route: '/admin/karyawan' }
  ];

  recentActivities: Activity[] = [];

  /* === CHART DATA === */
  monthlyData: MonthData[] = [];
  trendData: TrendData[] = [];
  conversionData: ConversionData[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  /* =====================
     LOAD DASHBOARD
  ===================== */
  loadDashboard(): void {
    this.loading = true;

    this.dashboardService.loadDashboard().subscribe({
      next: (res) => {

        /* ---- STAT CARDS ---- */
        if (res.leadStats?.success) {
          this.stats[1].value = res.leadStats.data.hotLeads ?? 0;
        }

        if (res.klien?.success) {
          this.stats[0].value = res.klien.data.length;
        }

        if (res.karyawan?.success) {
          this.stats[3].value = res.karyawan.data.length;
        }

        if (res.pending?.success) {
          this.stats[2].value = res.pending.data.length;
        }

        /* ---- CHART DATA ---- */
        this.monthlyData = res.monthly?.data?.data ?? [];
        this.trendData = res.trend?.data?.data ?? [];
        this.conversionData = res.conversion?.data?.data ?? [];

        /* ---- ACTIVITIES ---- */
        if (res.activities?.success) {
          this.mapActivities(res.activities.data);
        } else {
          this.setEmptyActivity();
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard load failed:', err);
        this.setEmptyActivity();
        this.loading = false;
      }
    });
  }

  /* =====================
     ACTIVITIES
  ===================== */
  private mapActivities(data: ActivityResponse[]): void {
    if (!data?.length) {
      this.setEmptyActivity();
      return;
    }

    this.recentActivities = data.map(item => ({
      icon: this.getPriorityIcon(item.skorPrioritas),
      text: item.description,
      time: this.formatTimeAgo(item.tglAnalisaAi),
      type: this.getPriorityType(item.skorPrioritas)
    }));
  }

  private setEmptyActivity(): void {
    this.recentActivities = [{
      icon: '📊',
      text: 'Belum ada aktivitas lead scoring',
      time: 'Baru saja',
      type: 'info'
    }];
  }

  /* =====================
     HELPERS
  ===================== */
  getPriorityIcon(priority: 'HOT' | 'WARM' | 'COLD' | null): string {
    switch (priority) {
      case 'HOT': return '';
      case 'WARM': return '';
      case 'COLD': return '';
      default: return '📊';
    }
  }

  getPriorityType(
    priority: 'HOT' | 'WARM' | 'COLD' | null
  ): 'success' | 'info' | 'primary' {
    switch (priority) {
      case 'HOT': return 'success';
      case 'WARM': return 'primary';
      case 'COLD': return 'info';
      default: return 'info';
    }
  }

  formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();

    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);

    if (m < 1) return 'Baru saja';
    if (m < 60) return `${m} menit yang lalu`;
    if (h < 24) return `${h} jam yang lalu`;
    if (d < 7) return `${d} hari yang lalu`;

    return past.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  navigateTo(route?: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  getActivityClass(activity: Activity): string {
    return `activity-${activity.type}`;
  }
}