import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to prevent authenticated users from accessing signin/signup pages
 * If user is already authenticated, redirect them to their appropriate dashboard
 */
export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    // Get current user to determine role
    const currentUser = authService.getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase() || '';
    
    // Redirect based on role
    if (userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse') {
      router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      router.navigate(['/appointments'], { replaceUrl: true });
    }
    return false;
  }

  // User is not authenticated, allow access to signin/signup
  return true;
};


