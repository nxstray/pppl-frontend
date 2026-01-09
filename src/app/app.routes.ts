import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { AnalysisGuard } from './guard/analysis.guard';

import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/client/login/login.component';
import { ClientFormComponent } from './pages/client/client-form/client-form.component';
import { WhoWeAreComponent } from './pages/client/who-we-are/who-we-are.component';
import { WhatWeDoComponent } from './pages/client/what-we-do/what-we-do.component';

import { KlienComponent } from './pages/admin/klien-page/klien.component';
import { RekapComponent } from './pages/admin/rekap-page/rekap.component';
import { ManagerComponent } from './pages/admin/manager-page/manager.component';
import { LayananComponent } from './pages/admin/layanan-page/layanan.component';
import { KaryawanComponent } from './pages/admin/karyawan-page/karyawan.component';
import { DashboardComponent } from './pages/admin/dashboard-page/dashboard.component';
import { AdminLayoutComponent } from './pages/admin/layout-page/admin-layout.component';
import { LeadScoringComponent } from './pages/admin/scoring-page/lead-scoring.component';
import { RequestLayananComponent } from './pages/admin/request-page/request-layanan.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/client/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'build',
    loadComponent: () => import('./pages/client/client-form/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'who-we-are',
    loadComponent: () => import('./pages/client/who-we-are/who-we-are.component').then(m => m.WhoWeAreComponent)
  },
  {
    path: 'what-we-do',
    loadComponent: () => import('./pages/client/what-we-do/what-we-do.component').then(m => m.WhatWeDoComponent)
  },
  {
    path: 'our-work',
    loadComponent: () => import('./pages/client/our-work/our-work.component').then(m => m.OurWorkComponent)
  },
  
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/layout-page/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard-page/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'lead-scoring',
        loadComponent: () => import('./pages/admin/scoring-page/lead-scoring.component')
          .then(m => m.LeadScoringComponent),
        canDeactivate: [AnalysisGuard]
      },
      {
        path: 'karyawan',
        loadComponent: () => import('./pages/admin/karyawan-page/karyawan.component')
          .then(m => m.KaryawanComponent)
      },
      {
        path: 'manager',
        loadComponent: () => import('./pages/admin/manager-page/manager.component')
          .then(m => m.ManagerComponent)
      },
      {
        path: 'klien',
        loadComponent: () => import('./pages/admin/klien-page/klien.component')
          .then(m => m.KlienComponent)
      },
      {
        path: 'layanan',
        loadComponent: () => import('./pages/admin/layanan-page/layanan.component')
          .then(m => m.LayananComponent)
      },
      {
        path: 'request-layanan',
        loadComponent: () => import('./pages/admin/request-page/request-layanan.component')
          .then(m => m.RequestLayananComponent)
      },
      {
        path: 'rekap',
        loadComponent: () => import('./pages/admin/rekap-page/rekap.component')
          .then(m => m.RekapComponent)
      }
    ]
  },
];