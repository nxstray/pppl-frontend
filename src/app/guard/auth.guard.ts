import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ApiResponse } from '../service/auth/auth.service';

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

  // Validate token dengan backend (cek user masih exist)
  if (authService.isTokenExpired()) {
    authService.checkAndCleanExpiredToken();
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Validasi ke backend
  return authService.validateToken().pipe(
    map((response: ApiResponse<boolean>) => {
      if (response.success && response.data === true) {
        return true;
      }

      authService.logout();
      return false;
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    })
  );
};