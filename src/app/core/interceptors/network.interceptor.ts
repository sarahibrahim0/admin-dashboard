import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ConnectivityService } from '../services/connectivity.service';
import { ToastService } from '../../shared/ui/toast.service';

const RETRYED_HEADER = 'x-network-retry';
const MAX_RETRIES = 2;

/** Statuses that mean the request never got a real answer from the app. */
function isTransient(err: unknown): boolean {
  const status = statusOf(err);
  if (status === 0) return true;
  // 503 is what the backend returns when Mongo is unreachable.
  if (status === 408 || status === 502 || status === 503 || status === 504) return true;
  return (err as { name?: string } | null)?.name === 'TimeoutError';
}

function statusOf(err: unknown): number {
  if (err instanceof HttpErrorResponse) return err.status;
  const raw = err as { status?: number } | null;
  return typeof raw?.status === 'number' ? raw.status : -1;
}

function isIdempotent(req: HttpRequest<unknown>): boolean {
  return req.method === 'GET' || req.method === 'HEAD';
}

/**
 * Registered before authInterceptor so it still sees the raw HttpErrorResponse.
 * The auth interceptor normalizes failures into plain ApiError objects, which
 * loses the distinction between "no response at all" and a real error status.
 */
export const networkInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return next(req);

  const connectivity = inject(ConnectivityService);
  const toasts = inject(ToastService);
  let notified = false;

  const run = (request: HttpRequest<unknown>, depth: number): Observable<HttpEvent<unknown>> =>
    next(request).pipe(
      // Any response at all proves the server is reachable.
      tap(() => connectivity.reportReachable()),
      catchError((err: unknown) => {
        if (!isTransient(err)) {
          connectivity.reportReachable();
          return throwError(() => err);
        }

        connectivity.reportUnreachable();
        if (!notified) {
          notified = true;
          // ToastService takes translation keys, resolved by LanguageService.
          toasts.error(
            isBrowserOffline()
              ? 'You are offline. Check your connection and try again.'
              : 'The server is temporarily unreachable. Please try again.',
          );
        }

        // Only replay reads, and never more than the budget: a write that failed
        // on a dropped connection may already have been applied server-side.
        if (!isIdempotent(request) || depth >= MAX_RETRIES) {
          return throwError(() => err);
        }

        const retryReq = request.clone({ setHeaders: { [RETRYED_HEADER]: String(depth + 1) } });
        return run(retryReq, depth + 1);
      }),
    );

  return run(req, 0);
};

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
