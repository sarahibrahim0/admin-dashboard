import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const permissionGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  // Refresh the assigned role so permission edits take effect on the next navigation.
  await auth.loadProfile();

  const requiredPermission = route.data?.['permission'] as string;
  if (!requiredPermission) return true;
  const role = auth.user()?.role;
  // Accounts without an assigned role retain their existing full-access behavior.
  if (!role) return true;
  const userPermissions = role.permissions || [];
  return userPermissions.includes(requiredPermission)
    ? true
    : router.createUrlTree(['/admin/settings/profile']);
};
