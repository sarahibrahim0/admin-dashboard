import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthStore } from '../stores/auth.store';
import { normalizeApiError } from '../services/api-error';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/refresh') && !isRefreshing) {
        isRefreshing = true;
        return from(auth.refreshAccessToken()).pipe(
          switchMap((success) => {
            isRefreshing = false;
            if (success) {
              const newToken = auth.token();
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
              return next(retryReq);
            }
            return throwError(() => normalizeApiError(err));
          }),
        );
      }
      return throwError(() => normalizeApiError(err));
    }),
  );
};
