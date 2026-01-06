import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { ToastService } from '../../../service/toast.service';
import { BellComponent } from '../../animation/bell-notification/bell.component';

interface MenuItem {
  label: string;
  route: string;
  badge?: number;
  roles?: string[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BellComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: any;
  
  menuItems: MenuItem[] = [
    { label: 'DASHBOARD', route: '/admin/dashboard' },
    { label: 'LEAD SCORING', route: '/admin/lead-scoring', badge: 5 },
    { label: 'KARYAWAN', route: '/admin/karyawan' },
    { label: 'MANAGER', route: '/admin/manager' },
    { label: 'KLIEN', route: '/admin/klien' },
    { label: 'LAYANAN', route: '/admin/layanan' },
    { label: 'REQUEST LAYANAN', route: '/admin/request-layanan' },
    { label: 'REKAP MEETING', route: '/admin/rekap' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  async logout() {
    if (await this.toast.helpConfirm('Apakah anda yakin ingin logout?', 'Anda akan keluar dari sistem.')) {
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