import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from auth service
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Log request for debugging
  console.log('Interceptor - Request URL:', req.url);
  console.log('Interceptor - Request method:', req.method);
  console.log('Interceptor - Has token:', !!token);

  // Handle the request and catch errors
  return next(req).pipe(
    tap(response => {
      // Log successful responses for debugging
      if (req.url.includes('/Rooms/')) {
        console.log('Interceptor - Response status: 200, URL:', req.url);
        console.log('Interceptor - Response:', response);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Interceptor - Error:', error);
      console.error('Interceptor - Error status:', error.status);
      console.error('Interceptor - Error body:', error.error);
      
      // If unauthorized (401), clear auth and redirect to login
      // But don't redirect if we're on signup/signin pages
      if (error.status === 401 && !req.url.includes('/signin') && !req.url.includes('/signup')) {
        authService.clearAuth();
        router.navigate(['/signin']);
      }
      return throwError(() => error);
    })
  );
};

