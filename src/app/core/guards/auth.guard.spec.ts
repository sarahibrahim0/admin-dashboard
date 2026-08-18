import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../stores/auth.store';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'admin', canActivate: [authGuard], children: [] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('redirects to /login when not logged in', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('allows access when logged in', async () => {
    localStorage.setItem('ecom.token', 'test');
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any),
    );
    expect(result).toBeTrue();
  });
});
