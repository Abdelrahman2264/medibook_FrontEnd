import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const roleService = inject(RoleService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get required roles from route data
  const allowedRoles = route.data['allowedRoles'] as string[] | undefined;
  const requiresManagement = route.data['requiresManagement'] as boolean | undefined;
  const requiresReportsAccess = route.data['requiresReportsAccess'] as boolean | undefined;
  const requiresRoomsAccess = route.data['requiresRoomsAccess'] as boolean | undefined;

  // If no role restrictions, allow access
  if (!allowedRoles && !requiresManagement && !requiresReportsAccess && !requiresRoomsAccess) {
    return true;
  }

  // Check role-based permissions
  let currentRole = roleService.getCurrentRole();
  
  // If role not loaded yet, try to refresh it
  if (!currentRole) {
    roleService.refresh();
    // Wait a moment and check again (role service loads from API asynchronously)
    currentRole = roleService.getCurrentRole();
    
    // If still not available, redirect to unauthorized
    if (!currentRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  // Check specific role requirements
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedCurrentRole = currentRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    
    if (!normalizedAllowedRoles.includes(normalizedCurrentRole)) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  // Check management permission
  if (requiresManagement && !roleService.canManage()) {
    router.navigate(['/unauthorized']);
    return false;
  }

  // Check reports access - doctors cannot access reports
  if (requiresReportsAccess && !roleService.canViewReports()) {
    router.navigate(['/unauthorized']);
    return false;
  }

  // Check rooms access
  if (requiresRoomsAccess && !roleService.canManageRooms()) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

