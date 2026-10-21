import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/ui/toast.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { Role, User } from '../../../core/models';
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

  it('updates the signed-in admin role from the profile form', async () => {
    const auth = TestBed.inject(AuthStore);
    const currentRole: Role = {
      id: 'role-1',
      _id: 'role-1',
      name: 'Admin',
      permissions: [],
      isDefault: false,
    };
    const selectedRole: Role = {
      id: 'role-2',
      _id: 'role-2',
      name: 'Editor',
      permissions: ['products:read'],
      isDefault: false,
    };
    const user: User = {
      id: 'user-1',
      _id: 'user-1',
      name: 'Admin',
      email: 'admin@example.com',
      phone: '0100',
      isAdmin: true,
      role: currentRole,
    };
    auth.token.set('test-token');
    auth.userId.set('user-1');
    auth.user.set(user);
    component.roles.set([currentRole, selectedRole]);
    component.form.patchValue({
      nameEn: 'Admin',
      email: 'admin@example.com',
      phone: '0100',
      role: 'role-2',
    });
    component.form.markAsDirty();

    const save = component.save();
    const profileRequest = mock.expectOne(`${environment.apiUrl}users/profile`);
    expect('role' in profileRequest.request.body).toBeFalse();
    profileRequest.flush(user);

    await Promise.resolve();
    await Promise.resolve();
    const roleRequest = mock.expectOne(`${environment.apiUrl}users/user-1`);
    expect(roleRequest.request.method).toBe('PUT');
    expect(roleRequest.request.body).toEqual({ role: 'role-2' });
    roleRequest.flush({ ...user, role: selectedRole });
    await save;

    expect(auth.user()?.role).toEqual(selectedRole);
    expect(component.form.pristine).toBeTrue();
    expect(toasts.toasts().some((toast) => toast.key === 'Profile saved')).toBeTrue();
    mock.verify();
  });

  it('sends null when clearing the profile role', async () => {
    const auth = TestBed.inject(AuthStore);
    auth.token.set('test-token');
    auth.userId.set('user-1');
    auth.user.set({
      id: 'user-1',
      _id: 'user-1',
      name: 'Admin',
      email: 'admin@example.com',
      phone: '0100',
      isAdmin: true,
      role: {
        id: 'role-1',
        _id: 'role-1',
        name: 'Admin',
        permissions: [],
        isDefault: false,
      },
    });
    component.form.patchValue({
      nameEn: 'Admin',
      email: 'admin@example.com',
      phone: '0100',
      role: '',
    });
    component.form.markAsDirty();

    const save = component.save();
    mock.expectOne(`${environment.apiUrl}users/profile`).flush(auth.user());

    await Promise.resolve();
    await Promise.resolve();
    const roleRequest = mock.expectOne(`${environment.apiUrl}users/user-1`);
    expect(roleRequest.request.body).toEqual({ role: null });
    roleRequest.flush({ ...auth.user(), role: null });
    await save;
    mock.verify();
  });
});
