import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthStore } from '../stores/auth.store';
import { normalizeApiError } from '../services/api-error';
import { LanguageService } from '../services/language.service';

let isRefreshing = false;
let refreshSubject: BehaviorSubject<boolean | null> | null = null;

function retryWithNewToken(
  req: HttpRequest<unknown>,
  auth: AuthStore,
  language: LanguageService,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const newToken = auth.token();
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${newToken}`, 'x-language': language.language() },
    }),
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const language = inject(LanguageService);
  const token = auth.token();
  const headers: Record<string, string> = { 'x-language': language.language() };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const request = req.clone({ setHeaders: headers });

  return next(request).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject = new BehaviorSubject<boolean | null>(null);
          return from(auth.refreshAccessToken()).pipe(
            catchError(() => of(false)),
            switchMap((success) => {
              refreshSubject?.next(success);
              refreshSubject?.complete();
              if (success) {
                return retryWithNewToken(req, auth, language, next);
              }
              return throwError(() => normalizeApiError(err));
            }),
            finalize(() => {
              isRefreshing = false;
              refreshSubject = null;
            }),
          );
        }
        if (refreshSubject) {
          return refreshSubject.pipe(
            filter((success) => success !== null),
            take(1),
            switchMap((success) => {
              if (success) {
                return retryWithNewToken(req, auth, language, next);
              }
              return throwError(() => normalizeApiError(err));
            }),
          );
        }
      }
      return throwError(() => normalizeApiError(err));
    }),
  );
};