import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has token
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if token is expired
  if (authService.isTokenExpired()) {
    console.log('Token expired, redirecting to login...');
    authService.checkAndCleanExpiredToken(); // Clean up
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check if route requires specific role
  const requiredRole = route.data['role'];
  
  if (requiredRole && !authService.hasRole(requiredRole)) {
    // User doesn't have required role
    router.navigate(['/admin/dashboard']);
    return false;
  }
  
  return true;
};