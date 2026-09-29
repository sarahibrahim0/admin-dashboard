import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/ui/toast.service';
import { MediaService, UploadedImage } from './media.service';

function makeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function png(name = 'photo.png', size = 1024): File {
  return makeFile(name, 'image/png', size);
}

describe('MediaService', () => {
  let service: MediaService;
  let http: HttpClient;
  let mock: HttpTestingController;
  let toasts: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MediaService);
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => mock.verify());

  function lastToast(): string {
    const list = toasts.toasts();
    return list.length ? list[list.length - 1].key : '';
  }

  describe('validation', () => {
    it('accepts a normal png', () => {
      expect(service.validateImages([png()])).toBeTrue();
      expect(toasts.toasts().length).toBe(0);
    });

    it('rejects a non-image file', () => {
      expect(service.validateImages([makeFile('a.pdf', 'application/pdf', 10)])).toBeFalse();
      expect(lastToast()).toContain('image files');
    });

    it('rejects an empty selection', () => {
      expect(service.validateImages([])).toBeFalse();
      expect(lastToast()).toContain('No file selected');
    });

    it('rejects a file over 5MB, matching the documented backend limit', () => {
      expect(service.maxImageBytes).toBe(5 * 1024 * 1024);
      expect(service.validateImages([png('big.png', 5 * 1024 * 1024 + 1)])).toBeFalse();
      expect(lastToast()).toContain('5MB');
    });

    it('accepts a file exactly at the limit', () => {
      expect(service.validateImages([png('edge.png', 5 * 1024 * 1024)])).toBeTrue();
    });

    it('rejects more than 10 images in a batch', () => {
      const many = Array.from({ length: 11 }, (_, i) => png(`p${i}.png`));
      expect(service.validateImages(many)).toBeFalse();
      expect(lastToast()).toContain('10 images');
    });
  });

  describe('uploadImage', () => {
    it('POSTs multipart to /media/image with image and folder fields', () => {
      const file = png();
      let result: UploadedImage | undefined;
      service.uploadImage(file, 'admins').subscribe((r) => (result = r));

      const req = mock.expectOne(`${environment.apiUrl}media/image`);
      expect(req.request.method).toBe('POST');
      const body = req.request.body as FormData;
      expect(body.get('image')).toBe(file);
      expect(body.get('folder')).toBe('admins');
      req.flush({ success: true, image: { url: 'https://cdn/a.png', publicId: 'p1', folder: 'admins' } });
      expect(result).toEqual({ url: 'https://cdn/a.png', publicId: 'p1', folder: 'admins' });
    });

    it('does not hit the network when validation fails', () => {
      let errored = false;
      service.uploadImage(makeFile('a.pdf', 'application/pdf', 5), 'admins').subscribe({
        error: () => (errored = true),
      });
      expect(errored).toBeTrue();
      mock.expectNone(`${environment.apiUrl}media/image`);
    });

    it('unwraps a { data: { image } } envelope', () => {
      let result: UploadedImage | undefined;
      service.uploadImage(png(), 'products').subscribe((r) => (result = r));
      mock.expectOne(`${environment.apiUrl}media/image`).flush({ data: { image: { url: 'u', publicId: 'p' } } });
      expect(result?.url).toBe('u');
    });

    it('surfaces an error when the response carries no url', () => {
      let message = '';
      service.uploadImage(png(), 'admins').subscribe({ error: (e) => (message = e.message) });
      mock.expectOne(`${environment.apiUrl}media/image`).flush({ success: true });
      expect(message).toContain('did not return an image url');
      expect(lastToast()).toContain('did not return an image url');
    });

    it('reports the server error message on failure', () => {
      let failed = false;
      service.uploadImage(png(), 'admins').subscribe({ error: () => (failed = true) });
      mock
        .expectOne(`${environment.apiUrl}media/image`)
        .flush({ message: 'file too large' }, { status: 400, statusText: 'Bad Request' });
      expect(failed).toBeTrue();
      expect(lastToast()).toBe('file too large');
    });

    it('does not duplicate the connectivity toast the network interceptor already raised', () => {
      service.uploadImage(png(), 'admins').subscribe({ error: () => {} });
      mock
        .expectOne(`${environment.apiUrl}media/image`)
        .flush(null, { status: 503, statusText: 'Service Unavailable' });
      expect(toasts.toasts().length).toBe(0);
    });

    it('emits upload progress as a percentage', () => {
      const seen: number[] = [];
      service.uploadImage(png(), 'admins', (pct) => seen.push(pct)).subscribe();
      const req = mock.expectOne(`${environment.apiUrl}media/image`);
      req.event({ type: HttpEventType.UploadProgress, loaded: 25, total: 100 } as never);
      req.event({ type: HttpEventType.UploadProgress, loaded: 100, total: 100 } as never);
      req.flush({ image: { url: 'u', publicId: 'p' } });
      expect(seen).toEqual([25, 100]);
    });
  });

  describe('uploadImages', () => {
    it('POSTs one repeated `images` field per file to /media/images', () => {
      const files = [png('a.png'), png('b.png')];
      let result: UploadedImage[] | undefined;
      service.uploadImages(files, 'products/gallery').subscribe((r) => (result = r));

      const req = mock.expectOne(`${environment.apiUrl}media/images`);
      const body = req.request.body as FormData;
      expect(body.getAll('images')).toEqual(files);
      expect(body.get('folder')).toBe('products/gallery');
      req.flush({
        success: true,
        images: [
          { url: 'u1', publicId: 'p1' },
          { url: 'u2', publicId: 'p2' },
        ],
      });
      expect(result?.map((i) => i.url)).toEqual(['u1', 'u2']);
    });

    it('surfaces an error when the response carries no images', () => {
      let message = '';
      service.uploadImages([png()], 'products/gallery').subscribe({ error: (e) => (message = e.message) });
      mock.expectOne(`${environment.apiUrl}media/images`).flush({ success: true, images: [] });
      expect(message).toContain('did not return any images');
    });

    it('reports the server error message on failure', () => {
      let failed = false;
      service.uploadImages([png()], 'products/gallery').subscribe({ error: () => (failed = true) });
      mock
        .expectOne(`${environment.apiUrl}media/images`)
        .flush({ message: 'no images uploaded' }, { status: 400, statusText: 'Bad Request' });
      expect(failed).toBeTrue();
      expect(lastToast()).toBe('no images uploaded');
    });
  });

  it('rejects a 401 and lets the auth interceptor refresh path own the recovery', () => {
    let status = 0;
    service.uploadImage(png(), 'admins').subscribe({
      error: (e) => (status = e instanceof HttpErrorResponse ? e.status : -1),
    });
    mock
      .expectOne(`${environment.apiUrl}media/image`)
      .flush({ message: 'not authorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(lastToast()).toBe('not authorized');
  });

  it('keeps http injection alive', () => {
    expect(http).toBeTruthy();
  });
});
