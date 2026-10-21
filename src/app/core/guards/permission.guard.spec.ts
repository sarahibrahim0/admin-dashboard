import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  GuardResult,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { signal } from '@angular/core';
import { AuthStore } from '../stores/auth.store';
import { permissionGuard } from './permission.guard';

interface GuardUser {
  isAdmin: boolean;
  role: { permissions: string[] } | null;
}

describe('permissionGuard', () => {
  let loggedIn: boolean;
  let user: ReturnType<typeof signal<GuardUser>>;
  let loadProfile: jasmine.Spy;

  beforeEach(() => {
    loggedIn = true;
    user = signal<GuardUser>({
      isAdmin: false,
      role: { permissions: ['products:read'] },
    });
    loadProfile = jasmine.createSpy('loadProfile').and.callFake(async () => user());
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isLoggedIn: () => loggedIn,
            isAdmin: () => user()?.isAdmin === true,
            user,
            loadProfile,
          },
        },
      ],
    });
  });

  async function canActivate(permission: string): Promise<GuardResult> {
    const route = { data: { permission } } as unknown as ActivatedRouteSnapshot;
    const guard = permissionGuard as (
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ) => Promise<GuardResult>;
    return TestBed.runInInjectionContext(() =>
      guard(route, {} as RouterStateSnapshot),
    );
  }

  it('refreshes the profile and allows an assigned permission', async () => {
    expect(await canActivate('products:read')).toBeTrue();
    expect(loadProfile).toHaveBeenCalled();
  });

  it('denies a permission removed from the refreshed role', async () => {
    loadProfile.and.callFake(async () => {
      user.set({ isAdmin: false, role: { permissions: [] } });
      return user();
    });

    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/admin/settings/profile'));
  });

  it('allows admins all permissions regardless of their assigned role', async () => {
    user.set({ isAdmin: true, role: { permissions: [] } });
    expect(await canActivate('products:read')).toBeTrue();
    expect(loadProfile).not.toHaveBeenCalled();
  });

  it('preserves access for non-admin accounts without an assigned role', async () => {
    user.set({ isAdmin: false, role: null });
    expect(await canActivate('products:read')).toBeTrue();
  });

  it('redirects signed-out users to login', async () => {
    loggedIn = false;
    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
    expect(loadProfile).not.toHaveBeenCalled();
  });
});
