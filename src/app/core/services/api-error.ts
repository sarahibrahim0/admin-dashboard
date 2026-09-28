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

  if (err && typeof err === 'object' && 'message' in err) {
    const apiError = err as Partial<ApiError>;
    return {
      message: String(apiError.message),
      status: typeof apiError.status === 'number' ? apiError.status : 0,
    };
  }

  return { message: 'An unexpected error occurred', status: 0 };
}
