import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthStore } from './auth.store';
import { environment } from '../../../environments/environment';

describe('AuthStore', () => {
  let store: AuthStore;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('starts logged out when no token', () => {
    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
  });

  it('login stores token and user', async () => {
    const loginRes = { user: 'test@test.com', token: 'acc_123', refreshToken: 'ref_123', userId: 'u1' };
    const userRes = { id: 'u1', name: 'Test', email: 'test@test.com', isAdmin: true };

    const loginPromise = store.login('test@test.com', 'pass123');

    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    loginReq.flush(loginRes);

    const meReq = http.expectOne(`${environment.apiUrl}users/u1`);
    meReq.flush(userRes);

    await loginPromise;

    expect(store.isLoggedIn()).toBeTrue();
    expect(store.token()).toBe('acc_123');
    expect(store.userId()).toBe('u1');
    expect(store.user()?.name).toBe('Test');
    expect(localStorage.getItem('ecom.token')).toBe('acc_123');
    expect(localStorage.getItem('ecom.refreshToken')).toBe('ref_123');
  });

  it('loads current role permissions when the profile only returns a role id', async () => {
    store.token.set('acc_123');

    const profilePromise = store.loadProfile();
    http.expectOne(`${environment.apiUrl}users/profile`).flush({
      id: 'u1',
      _id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      isAdmin: true,
      role: 'role-1',
    });
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({
      id: 'role-1',
      _id: 'role-1',
      name: 'Editor',
      permissions: ['products:read'],
      isDefault: false,
    });

    const user = await profilePromise;
    expect(user?.role?.permissions).toEqual(['products:read']);
    expect(store.hasPermission('products:read')).toBeTrue();
    expect(store.hasPermission('users:write')).toBeFalse();
  });

  it('refreshes permissions immediately when the signed-in user role is updated', async () => {
    store.token.set('acc_123');
    store.user.set({
      id: 'u1',
      _id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      phone: '',
      isAdmin: true,
      role: {
        id: 'role-1',
        _id: 'role-1',
        name: 'Editor',
        permissions: ['roles:write'],
        isDefault: false,
      },
    });

    const refreshPromise = store.refreshCurrentRole('role-1');
    http.expectOne(`${environment.apiUrl}users/profile`).flush({
      id: 'u1',
      _id: 'u1',
      isAdmin: true,
      role: 'role-1',
    });
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({
      id: 'role-1',
      _id: 'role-1',
      permissions: ['products:read'],
    });

    await expectAsync(refreshPromise).toBeResolvedTo(true);
    expect(store.hasPermission('roles:write')).toBeFalse();
    expect(store.hasPermission('products:read')).toBeTrue();
  });

  it('does not reload the profile when another role is updated', async () => {
    store.token.set('acc_123');
    store.user.set({
      id: 'u1',
      _id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      phone: '',
      isAdmin: true,
      role: {
        id: 'role-1',
        _id: 'role-1',
        name: 'Editor',
        permissions: [],
        isDefault: false,
      },
    });

    await expectAsync(store.refreshCurrentRole('role-2')).toBeResolvedTo(false);
    http.expectNone(`${environment.apiUrl}users/profile`);
  });

  it('logout clears state', () => {
    localStorage.setItem('ecom.token', 'test');
    localStorage.setItem('ecom.userId', 'u1');
    localStorage.setItem('ecom.refreshToken', 'ref');

    store.logout();

    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
    expect(localStorage.getItem('ecom.token')).toBeNull();
  });

  it('login rejects non-admin user and clears session', async () => {
    const loginRes = { user: 'user@test.com', token: 'acc_123', refreshToken: 'ref_123', userId: 'u2' };
    const userRes = { id: 'u2', name: 'Test', email: 'user@test.com', isAdmin: false };

    const loginPromise = store.login('user@test.com', 'pass123');
    loginPromise.catch(() => {});

    const loginReq = http.expectOne(`${environment.apiUrl}users/login`);
    loginReq.flush(loginRes);

    const meReq = http.expectOne(`${environment.apiUrl}users/u2`);
    meReq.flush(userRes);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const logoutReq = http.expectOne(`${environment.apiUrl}auth/logout`);
    logoutReq.flush({ message: 'ok' });

    await expectAsync(loginPromise).toBeRejected();

    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
    expect(store.userId()).toBeNull();
    expect(store.user()).toBeNull();
    expect(localStorage.getItem('ecom.token')).toBeNull();
    expect(store.error()).toContain('admin');
  });
});
