import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check role-based access if required roles are specified
  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const currentUser = authService.getCurrentUser();
    const userRole = currentUser?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      // User doesn't have required role, redirect to unauthorized or dashboard
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};


