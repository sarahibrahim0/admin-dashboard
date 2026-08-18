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

  it('logout clears state', () => {
    localStorage.setItem('ecom.token', 'test');
    localStorage.setItem('ecom.userId', 'u1');
    localStorage.setItem('ecom.refreshToken', 'ref');

    store.logout();

    expect(store.isLoggedIn()).toBeFalse();
    expect(store.token()).toBeNull();
    expect(localStorage.getItem('ecom.token')).toBeNull();
  });
});
