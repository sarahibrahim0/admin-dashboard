import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (!auth.user()) await auth.loadUser();
  if (!auth.user()) return router.createUrlTree(['/login']);
  if (!auth.isAdmin()) return router.createUrlTree(['/login']);
  return true;
};
