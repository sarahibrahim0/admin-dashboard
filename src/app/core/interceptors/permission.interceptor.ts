import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from '../../shared/ui/toast.service';

const PERMISSION_BY_RESOURCE: Record<string, string> = {
  'audit-logs': 'audit-logs',
  categories: 'categories',
  coupons: 'coupons',
  countries: 'countries',
  currencies: 'currencies',
  orders: 'orders',
  payments: 'payments',
  'payment-methods': 'payments',
  transactions: 'payments',
  products: 'products',
  reviews: 'reviews',
  roles: 'roles',
  settings: 'settings',
  users: 'users',
};

const PUBLIC_USER_ENDPOINTS = [
  'login',
  'register',
  'verify-email',
  'resend-verification',
  'forgot-password',
  'reset-password',
];

function isMutation(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

function isRoleAssignment(body: unknown): boolean {
  if (
    !body
    || typeof body !== 'object'
    || (typeof FormData !== 'undefined' && body instanceof FormData)
  ) return false;
  return Object.prototype.hasOwnProperty.call(body, 'role')
    || Object.prototype.hasOwnProperty.call(body, 'isAdmin');
}

function requiredPermissions(req: HttpRequest<unknown>): string[] {
  if (!isMutation(req.method)) return [];

  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  const requestUrl = req.url.split(/[?#]/)[0];
  if (!requestUrl.startsWith(`${apiBase}/`)) return [];

  const segments = requestUrl.slice(apiBase.length + 1).split('/').filter(Boolean);
  const resource = segments[0];
  if (
    !resource
    || (resource === 'users'
      && (segments[1] === 'profile' || PUBLIC_USER_ENDPOINTS.includes(segments[1] || '')))
  ) return [];

  if (resource === 'media') {
    const folder = typeof FormData !== 'undefined' && req.body instanceof FormData
      ? String(req.body.get('folder') || '').toLowerCase()
      : '';
    const mediaResource = folder.includes('product')
      ? 'products'
      : folder.includes('categor')
        ? 'categories'
        : '';
    return mediaResource ? [`${mediaResource}:write`] : [];
  }

  const permissionResource = PERMISSION_BY_RESOURCE[resource];
  if (!permissionResource) return [];

  const action = req.method === 'DELETE' ? 'delete' : 'write';
  const permissions = [`${permissionResource}:${action}`];
  if (resource === 'users' && isRoleAssignment(req.body)) {
    permissions.push('roles:write');
  }
  return permissions;
}

export const permissionInterceptor: HttpInterceptorFn = (req, next) => {
  const required = requiredPermissions(req);
  if (!required.length) return next(req);

  const auth = inject(AuthStore);
  const toast = inject(ToastService);

  return from(auth.loadProfile()).pipe(
    switchMap(() => {
      const missing = required.find((permission) => !auth.hasPermission(permission));
      if (!missing) return next(req);

      const message = 'You do not have permission to perform this action.';
      toast.error(message);
      return throwError(() => new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: { message },
        url: req.url,
      }));
    }),
  );
};
