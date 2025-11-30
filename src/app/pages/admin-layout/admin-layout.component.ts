import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

interface MenuItem {
  label: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: any;
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Lead Scoring', route: '/admin/lead-scoring', badge: 5 },
    { label: 'Karyawan', route: '/admin/karyawan' },
    { label: 'Manager', route: '/admin/manager' },
    { label: 'Klien', route: '/admin/klien' },
    { label: 'Layanan', route: '/admin/layanan' },
    { label: 'Request Layanan', route: '/admin/request-layanan' },
    { label: 'Rekap Meeting', route: '/admin/rekap' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    if (confirm('Apakah anda yakin ingin logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  goToProfile() {
    this.router.navigate(['/admin/profile']);
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    const menuItem = this.menuItems.find(item => url.includes(item.route));
    return menuItem ? menuItem.label : 'Dashboard';
  }

  defineGetCurrentPageTitle() {
    return null;
  }
}