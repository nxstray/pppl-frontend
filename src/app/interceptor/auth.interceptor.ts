import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone request and add token if available
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Auto logout on 401 Unauthorized
      if (error.status === 401) {
        console.log('401 Unauthorized - Token expired or invalid');
        authService.checkAndCleanExpiredToken();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};