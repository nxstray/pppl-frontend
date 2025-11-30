import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface StatCard {
  title: string;
  value: number;
  color: string;
  trend?: number;
  route?: string;
}

interface LeadStats {
  totalLeads: number;
  analyzedLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  
  stats: StatCard[] = [
    { title: 'Total Klien', value: 0, color: '#4CAF50', route: '/admin/klien' },
    { title: 'Hot Leads', value: 0, color: '#dc3545', trend: 67, route: '/admin/lead-scoring' },
    { title: 'Request Pending', value: 0, color: '#ffc107', route: '/admin/request-layanan' },
    { title: 'Total Karyawan', value: 0, color: '#2196F3', route: '/admin/karyawan' }
  ];

  recentActivities = [

  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load lead scoring statistics
    this.http.get<any>(`${environment.apiUrl}/admin/lead-scoring/statistics`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            const data: LeadStats = response.data;
            this.stats[0].value = data.totalLeads;
            this.stats[1].value = data.hotLeads;
            // Update other stats as needed
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.loading = false;
        }
      });

    // Load other statistics (klien, karyawan, etc)
    this.loadKlienCount();
    this.loadKaryawanCount();
    this.loadPendingRequests();
  }

  loadKlienCount() {
    this.http.get<any>(`${environment.apiUrl}/klien`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stats[0].value = response.data.length;
          }
        },
        error: (error) => console.error('Error loading klien:', error)
      });
  }

  loadKaryawanCount() {
    this.http.get<any>(`${environment.apiUrl}/karyawan`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stats[3].value = response.data.length;
          }
        },
        error: (error) => console.error('Error loading karyawan:', error)
      });
  }

  loadPendingRequests() {
    this.http.get<any>(`${environment.apiUrl}/request-layanan/menunggu-verifikasi`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stats[2].value = response.data.length;
          }
        },
        error: (error) => console.error('Error loading pending requests:', error)
      });
  }

  navigateTo(route?: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  getActivityClass(type: string): string {
    return `activity-${type}`;
  }
}
