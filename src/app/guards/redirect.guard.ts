import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) {
      router.navigate(['/signin'], { replaceUrl: true });
      return false;
    }

    // Get current role from stored user (synchronous check)
    const storedUser = authService.getCurrentUser();
    const currentRole = storedUser?.role?.toLowerCase()?.trim() || '';
    
    // Determine if user role
    const isUser = currentRole === 'user' || currentRole === 'patient';

    // Redirect based on role
    if (isUser) {
      // User role: redirect to appointments
      router.navigate(['/appointments'], { replaceUrl: true });
    } else if (currentRole === 'admin' || currentRole === 'doctor' || currentRole === 'nurse') {
      // Admin, Doctor, Nurse: redirect to dashboard
      router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      // Unknown role or no role: default to appointments
      router.navigate(['/appointments'], { replaceUrl: true });
    }
  } catch (error) {
    console.error('Error in redirect guard:', error);
    // Fallback to signin if there's an error
    router.navigate(['/signin'], { replaceUrl: true });
  }

  return false; // Always redirect, never allow access to empty route
};

