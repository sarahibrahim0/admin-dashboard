import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models';

export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    return {
      message: body?.message || body?.error || err.statusText || 'Request failed',
      status: err.status,
    };
  }
  return { message: 'An unexpected error occurred', status: 0 };
}
