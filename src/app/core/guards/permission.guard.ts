import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.isAdmin()) return true;
  const requiredPermission = route.data?.['permission'] as string;
  if (!requiredPermission) return true;
  const userPermissions = auth.user()?.role?.permissions || [];
  return userPermissions.includes(requiredPermission) ? true : router.createUrlTree(['/admin']);
};
