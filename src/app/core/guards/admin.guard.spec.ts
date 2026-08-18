import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
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
});
