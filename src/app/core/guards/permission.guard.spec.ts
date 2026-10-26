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
import { LanguageService } from '../services/language.service';
import { ToastService } from '../../shared/ui/toast.service';
import { permissionGuard } from './permission.guard';

interface GuardUser {
  isAdmin: boolean;
  role: { permissions: string[] } | null;
}

describe('permissionGuard', () => {
  let loggedIn: boolean;
  let user: ReturnType<typeof signal<GuardUser>>;
  let loadProfile: jasmine.Spy;
  let hasPermission: jasmine.Spy;
  let toastError: jasmine.Spy;

  beforeEach(() => {
    loggedIn = true;
    user = signal<GuardUser>({
      isAdmin: false,
      role: { permissions: ['products:read'] },
    });
    loadProfile = jasmine.createSpy('loadProfile').and.callFake(async () => user());
    hasPermission = jasmine.createSpy('hasPermission').and.callFake((permission: string) =>
      user()?.role?.permissions.includes(permission) === true,
    );
    toastError = jasmine.createSpy('toastError');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isLoggedIn: () => loggedIn,
            user,
            loadProfile,
            hasPermission,
          },
        },
        { provide: ToastService, useValue: { error: toastError } },
      ],
    });
  });

  async function canActivate(permission: string, url = '/admin/products'): Promise<GuardResult> {
    const route = {
      data: {},
      pathFromRoot: [{ data: { permission } }],
    } as unknown as ActivatedRouteSnapshot;
    const guard = permissionGuard as (
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ) => Promise<GuardResult>;
    return TestBed.runInInjectionContext(() =>
      guard(route, { url } as RouterStateSnapshot),
    );
  }

  it('refreshes the profile before checking the assigned permission', async () => {
    expect(await canActivate('products:read')).toBeTrue();
    expect(loadProfile).toHaveBeenCalled();
    expect(hasPermission).toHaveBeenCalledWith('products:read');
  });

  it('denies a permission removed from the refreshed role', async () => {
    loadProfile.and.callFake(async () => {
      user.set({ isAdmin: false, role: { permissions: [] } });
      return user();
    });

    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
  });

  it('does not let isAdmin bypass the role permission', async () => {
    user.set({ isAdmin: true, role: { permissions: [] } });
    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
    expect(loadProfile).toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('You do not have permission to access this page.');
  });

  it('shows the denied-navigation toast in the selected language', async () => {
    const language = TestBed.inject(LanguageService);
    const selectedLanguage = language.language();
    user.set({ isAdmin: false, role: { permissions: [] } });
    language.setLanguage('ar');

    try {
      await canActivate('products:read');
      expect(toastError).toHaveBeenCalledWith('ليس لديك صلاحية للوصول إلى هذه الصفحة.');
    } finally {
      language.setLanguage(selectedLanguage);
    }
  });

  it('denies protected pages when there is no role', async () => {
    user.set({ isAdmin: true, role: null });
    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
  });

  it('requires write permission before opening create and edit pages', async () => {
    user.set({ isAdmin: true, role: { permissions: ['products:read'] } });
    const result = await canActivate('products:read', '/admin/products/new');
    expect(hasPermission).toHaveBeenCalledWith('products:write');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/admin/products'));
  });

  it('redirects signed-out users to login without loading the profile', async () => {
    loggedIn = false;
    const result = await canActivate('products:read');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
    expect(loadProfile).not.toHaveBeenCalled();
  });

  it('denies pages without a configured permission', async () => {
    const route = {
      data: {},
      pathFromRoot: [{ data: {} }],
    } as unknown as ActivatedRouteSnapshot;
    const guard = permissionGuard as (
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ) => Promise<GuardResult>;

    expect(await TestBed.runInInjectionContext(() =>
      guard(route, { url: '/admin/unconfigured' } as RouterStateSnapshot),
    )).toEqual(TestBed.inject(Router).parseUrl('/admin/products'));
  });

  it('surfaces profile refresh errors and cancels navigation', async () => {
    loadProfile.and.rejectWith(new Error('profile unavailable'));
    expect(await canActivate('products:read')).toBeFalse();
    expect(toastError).toHaveBeenCalledWith('profile unavailable');
  });
});
