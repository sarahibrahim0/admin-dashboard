import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models';

export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string; error?: string } | string | null;
    const fromBody = typeof body === 'string' ? body : body?.message || body?.error;
    if (fromBody) {
      return { message: fromBody, status: err.status };
    }
    // status 0 means no response arrived at all: the device is offline, DNS
    // failed, CORS blocked it, or the request timed out. That is different from
    // the server answering with an error, so it gets dedicated wording.
    if (err.status === 0) {
      return {
        message: isBrowserOffline()
          ? 'You are offline. Check your connection and try again.'
          : 'The server is temporarily unreachable. Please try again.',
        status: 0,
      };
    }
    return { message: err.statusText || 'Request failed', status: err.status };
  }

  if (err && typeof err === 'object' && 'message' in err) {
    const apiError = err as Partial<ApiError>;
    return {
      message: String(apiError.message),
      status: typeof apiError.status === 'number' ? apiError.status : 0,
    };
  }

  return { message: 'An unexpected error occurred', status: 0 };
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
