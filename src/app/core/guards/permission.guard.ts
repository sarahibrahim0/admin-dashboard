import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';
import { normalizeApiError } from '../services/api-error';
import { LanguageService } from '../services/language.service';
import { ToastService } from '../../shared/ui/toast.service';

const ACCESSIBLE_ROUTES: { permission: string; path: string }[] = [
  { permission: 'dashboard:read', path: '/admin/dashboard' },
  { permission: 'products:read', path: '/admin/products' },
  { permission: 'categories:read', path: '/admin/categories' },
  { permission: 'orders:read', path: '/admin/orders' },
  { permission: 'coupons:read', path: '/admin/coupons' },
  { permission: 'payments:read', path: '/admin/payments' },
  { permission: 'countries:read', path: '/admin/countries' },
  { permission: 'currencies:read', path: '/admin/currencies' },
  { permission: 'users:read', path: '/admin/users' },
  { permission: 'reviews:read', path: '/admin/reviews' },
  { permission: 'roles:read', path: '/admin/roles' },
  { permission: 'audit-logs:read', path: '/admin/audit-logs' },
  { permission: 'settings:read', path: '/admin/settings/profile' },
];

export const permissionGuard: CanActivateChildFn = async (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);
  const language = inject(LanguageService);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  try {
    await auth.loadProfile();
  } catch (err) {
    toast.error(normalizeApiError(err).message);
    return false;
  }

  const requiredPermission = route.pathFromRoot.reduce(
    (permission, snapshot) => snapshot.data?.['permission'] as string || permission,
    '',
  );
  if (!requiredPermission) {
    toast.error(language.translate('This page does not have a permission configured.'));
    const fallback = ACCESSIBLE_ROUTES.find(({ permission }) => auth.hasPermission(permission));
    return router.createUrlTree([fallback?.path || '/login']);
  }

  const isWritePage = /\/(?:new|edit)\/?$/.test(state.url.split(/[?#]/)[0]);
  const permission = isWritePage
    ? requiredPermission.replace(/:read$/, ':write')
    : requiredPermission;

  if (auth.hasPermission(permission)) return true;

  toast.error(language.translate('You do not have permission to access this page.'));
  const fallback = ACCESSIBLE_ROUTES.find(({ permission: candidate }) =>
    auth.hasPermission(candidate),
  );
  return router.createUrlTree([fallback?.path || '/login']);
};
