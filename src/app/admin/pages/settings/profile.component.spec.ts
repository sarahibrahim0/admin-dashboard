import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/ui/toast.service';
import { ProfileComponent } from './profile.component';

/**
 * The profile page is the only screen that uploads an admin avatar, and the
 * only one whose save path is not a plain entity update (it falls back to
 * PUT /users/:id). These lock the request shape down.
 */
describe('ProfileComponent upload', () => {
  let component: ProfileComponent;
  let mock: HttpTestingController;
  let toasts: ToastService;

  function png(name = 'avatar.png', size = 2048): File {
    const file = new File(['x'], name, { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function select(file: File): void {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    component.onImageSelect({ target: input } as unknown as Event);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    mock = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
    TestBed.runInInjectionContext(() => {
      component = new ProfileComponent();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('uploads the avatar to /media/image under the admins folder', () => {
    const file = png();
    select(file);
    expect(component.showUploadDialog()).toBeTrue();

    component.confirmUpload();

    const req = mock.expectOne(`${environment.apiUrl}media/image`);
    expect(req.request.body.get('image')).toBe(file);
    expect(req.request.body.get('folder')).toBe('admins');
    req.flush({ success: true, image: { url: 'https://cdn/avatar.png', publicId: 'av1' } });

    expect(component.uploading()).toBeFalse();
    expect(component.imagePreview()).toBe('https://cdn/avatar.png');
    expect(component.image?.publicId).toBe('av1');
    expect(toasts.toasts().some((t) => t.key === 'Photo uploaded')).toBeTrue();
    mock.verify();
  });

  it('never reaches the network for a non-image file', () => {
    const pdf = new File(['x'], 'resume.pdf', { type: 'application/pdf' });
    select(pdf);
    expect(component.showUploadDialog()).toBeFalse();
    mock.expectNone(`${environment.apiUrl}media/image`);
  });

  it('never reaches the network for a file over 5MB', () => {
    select(png('huge.png', 5 * 1024 * 1024 + 1));
    expect(component.showUploadDialog()).toBeFalse();
    mock.expectNone(`${environment.apiUrl}media/image`);
  });

  it('leaves the page usable and reports the reason when the upload fails', () => {
    select(png());
    component.confirmUpload();
    mock
      .expectOne(`${environment.apiUrl}media/image`)
      .flush({ message: 'unsupported file' }, { status: 400, statusText: 'Bad Request' });

    expect(component.uploading()).toBeFalse();
    expect(component.imagePreview()).toBe('');
    expect(toasts.toasts().some((t) => t.key === 'unsupported file')).toBeTrue();
    mock.verify();
  });
});
