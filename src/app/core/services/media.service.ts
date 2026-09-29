import { HttpClient, HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { normalizeApiError } from './api-error';
import { ToastService } from '../../shared/ui/toast.service';

export interface UploadedImage {
  url: string;
  publicId: string;
  folder?: string;
}

/**
 * Single place for every multipart upload in the admin.
 *
 * Pages used to hand-roll `new FormData()` + `http.post(...)`, which meant: no
 * client-side limits, no progress, an unnormalised response read
 * (`res.image.url` threw whenever the payload was shaped differently), and a
 * dead `error: () => flag.set(false)` that failed completely silently. This
 * service validates first, reports progress, unwraps the response and always
 * raises a toast, so a failed upload is never a silent no-op.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  /** Backend limits documented in API.md (Media section). */
  readonly maxImageBytes = 5 * 1024 * 1024;
  readonly maxBatchSize = 10;

  /**
   * Rejects anything the backend would refuse anyway, so the user gets an
   * instant, specific message instead of a generic upload failure.
   * Returns true when every file is safe to send.
   */
  validateImages(files: File[]): boolean {
    if (!files.length) {
      this.toast.error('No file selected.');
      return false;
    }
    if (files.length > this.maxBatchSize) {
      this.toast.error(`You can upload up to ${this.maxBatchSize} images at a time.`);
      return false;
    }
    const wrongType = files.find((f) => !f.type.startsWith('image/'));
    if (wrongType) {
      this.toast.error('Only image files can be uploaded.');
      return false;
    }
    const tooBig = files.find((f) => f.size > this.maxImageBytes);
    if (tooBig) {
      this.toast.error('Images must be 5MB or smaller.');
      return false;
    }
    return true;
  }

  /** POST /media/image — a single image. */
  uploadImage(
    file: File,
    folder: string,
    onProgress?: (percent: number) => void,
  ): Observable<UploadedImage> {
    if (!this.validateImages([file])) return throwError(() => new Error('Invalid file'));
    const body = new FormData();
    body.append('image', file);
    body.append('folder', folder);
    return this.send<any>('media/image', body, onProgress).pipe(
      map((res) => this.readImage(res, 'image')),
      catchError(this.reportError),
    );
  }

  /** POST /media/images — a batch of images. */
  uploadImages(
    files: File[],
    folder: string,
    onProgress?: (percent: number) => void,
  ): Observable<UploadedImage[]> {
    if (!this.validateImages(files)) return throwError(() => new Error('Invalid file'));
    const body = new FormData();
    files.forEach((f) => body.append('images', f));
    body.append('folder', folder);
    return this.send<any>('media/images', body, onProgress).pipe(
      map((res) => this.readImages(res, 'images')),
      catchError(this.reportError),
    );
  }

  private send<T>(path: string, body: FormData, onProgress?: (percent: number) => void): Observable<T> {
    return this.http
      .post<T>(`${environment.apiUrl}${path}`, body, { observe: 'events', reportProgress: true })
      .pipe(
        tap((event) => {
          if (onProgress && event.type === HttpEventType.UploadProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        }),
        filter((event): event is HttpResponse<T> => event.type === HttpEventType.Response),
        map((event) => event.body as T),
      );
  }

  private readImage(res: any, key: string): UploadedImage {
    const image = res?.[key] ?? res?.data?.[key] ?? res?.data ?? res;
    if (!image?.url) throw new Error('The server did not return an image url.');
    return { url: image.url, publicId: image.publicId, folder: image.folder };
  }

  private readImages(res: any, key: string): UploadedImage[] {
    const images = res?.[key] ?? res?.data?.[key] ?? res?.data ?? res;
    if (!Array.isArray(images) || !images.length) throw new Error('The server did not return any images.');
    return images.map((image: UploadedImage) => ({
      url: image.url,
      publicId: image.publicId,
      folder: image.folder,
    }));
  }

  private readonly reportError = (err: unknown): Observable<never> => {
    // The network interceptor already toasts connectivity failures; repeating
    // them here would stack two identical toasts on every dropped request.
    if (!isConnectivityError(err)) this.toast.error(normalizeApiError(err).message);
    return throwError(() => err);
  };
}

/** Mirrors `isTransient` in the network interceptor: never got a real answer. */
function isConnectivityError(err: unknown): boolean {
  const status =
    err instanceof HttpErrorResponse
      ? err.status
      : typeof (err as { status?: number } | null)?.status === 'number'
        ? (err as { status: number }).status
        : -1;
  return status === 0 || status === 408 || status === 502 || status === 503 || status === 504;
}
