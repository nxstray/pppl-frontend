import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Check if route requires specific role
    const requiredRole = route.data['role'];
    
    if (requiredRole && !authService.hasRole(requiredRole)) {
      // User doesn't have required role
      router.navigate(['/admin/dashboard']);
      return false;
    }
    
    return true;
  }

  // Not logged in, redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};