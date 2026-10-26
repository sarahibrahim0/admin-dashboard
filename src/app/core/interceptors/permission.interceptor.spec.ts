import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from '../../shared/ui/toast.service';
import { environment } from '../../../environments/environment';
import { permissionInterceptor } from './permission.interceptor';

describe('permissionInterceptor', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  let loadProfile: jasmine.Spy;
  let hasPermission: jasmine.Spy;
  let toastError: jasmine.Spy;

  beforeEach(() => {
    loadProfile = jasmine.createSpy('loadProfile').and.resolveTo(null);
    hasPermission = jasmine.createSpy('hasPermission').and.returnValue(true);
    toastError = jasmine.createSpy('toastError');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([permissionInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: { loadProfile, hasPermission } },
        { provide: ToastService, useValue: { error: toastError } },
      ],
    });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => requests.verify());

  it('refreshes permissions before sending a write request', async () => {
    http.post(`${environment.apiUrl}products`, {}).subscribe();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loadProfile).toHaveBeenCalledTimes(1);
    expect(hasPermission).toHaveBeenCalledWith('products:write');
    requests.expectOne(`${environment.apiUrl}products`).flush({});
  });

  it('blocks a destructive request without the resource delete permission', async () => {
    hasPermission.and.returnValue(false);
    let status = 0;
    http.delete(`${environment.apiUrl}products/product-1`).subscribe({
      error: (err) => (status = err.status),
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(status).toBe(403);
    expect(toastError).toHaveBeenCalled();
    requests.expectNone(`${environment.apiUrl}products/product-1`);
  });

  it('requires role-management permission when a user role is assigned', async () => {
    hasPermission.and.callFake((permission: string) => permission !== 'roles:write');
    let status = 0;
    http.put(`${environment.apiUrl}users/user-1`, { role: 'role-1' }).subscribe({
      error: (err) => (status = err.status),
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(hasPermission).toHaveBeenCalledWith('users:write');
    expect(hasPermission).toHaveBeenCalledWith('roles:write');
    expect(status).toBe(403);
    requests.expectNone(`${environment.apiUrl}users/user-1`);
  });
});
