import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { adminGuard } from './admin.guard';
import { environment } from '../../../environments/environment';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', children: [] },
          { path: 'admin', canActivate: [adminGuard], children: [] },
        ]),
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('redirects to /login when not logged in', async () => {
    const router = TestBed.inject(Router);
    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('redirects to /login (not /) when logged in as non-admin, avoiding redirect loop', async () => {
    localStorage.setItem('ecom.token', 'tok');
    localStorage.setItem('ecom.userId', 'u1');
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);

    const resultPromise = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );
    http.expectOne(`${environment.apiUrl}users/profile`).flush({
      id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      isAdmin: false,
    });

    const result = await resultPromise;
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('allows logged-in admins through', async () => {
    localStorage.setItem('ecom.token', 'tok');
    localStorage.setItem('ecom.userId', 'u1');
    const http = TestBed.inject(HttpTestingController);

    const resultPromise = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );
    http.expectOne(`${environment.apiUrl}users/profile`).flush({
      id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      isAdmin: true,
    });

    const result = await resultPromise;
    expect(result).toBe(true);
  });
});