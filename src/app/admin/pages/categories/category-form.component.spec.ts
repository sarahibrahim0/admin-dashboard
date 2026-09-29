import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/ui/toast.service';
import { CategoryFormComponent } from './category-form.component';

describe('CategoryFormComponent upload', () => {
  let component: CategoryFormComponent;
  let mock: HttpTestingController;
  let toasts: ToastService;

  function png(name = 'cat.png', size = 4096): File {
    const file = new File(['x'], name, { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function select(file: File): void {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    component.onFileSelect({ target: input } as unknown as Event);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    mock = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
    TestBed.runInInjectionContext(() => {
      component = new CategoryFormComponent();
    });
  });

  it('uploads to /media/image under the categories folder', () => {
    const file = png();
    select(file);
    expect(component.showUploadDialog()).toBeTrue();

    component.confirmUpload();

    const req = mock.expectOne(`${environment.apiUrl}media/image`);
    expect(req.request.body.get('image')).toBe(file);
    expect(req.request.body.get('folder')).toBe('categories');
    req.flush({ success: true, image: { url: 'https://cdn/cat.png', publicId: 'c1' } });

    expect(component.uploading()).toBeFalse();
    expect(component.preview()).toBe('https://cdn/cat.png');
    expect(component.image?.publicId).toBe('c1');
    expect(toasts.toasts().some((t) => t.key === 'Image uploaded')).toBeTrue();
    mock.verify();
  });

  it('never reaches the network for a non-image file', () => {
    select(new File(['x'], 'doc.pdf', { type: 'application/pdf' }));
    expect(component.showUploadDialog()).toBeFalse();
    mock.expectNone(`${environment.apiUrl}media/image`);
  });

  it('keeps the previous image when the upload fails', () => {
    select(png());
    component.confirmUpload();
    mock
      .expectOne(`${environment.apiUrl}media/image`)
      .flush({ message: 'upload rejected' }, { status: 400, statusText: 'Bad Request' });

    expect(component.uploading()).toBeFalse();
    expect(component.preview()).toBe('');
    expect(toasts.toasts().some((t) => t.key === 'upload rejected')).toBeTrue();
    mock.verify();
  });

  it('blocks saving while an upload is still in flight', () => {
    select(png());
    component.confirmUpload();
    expect(component.uploading()).toBeTrue();
    component.submit();
    mock.expectNone(`${environment.apiUrl}categories`);
    mock.expectOne(`${environment.apiUrl}media/image`).flush({ image: { url: 'u', publicId: 'p' } });
  });
});
