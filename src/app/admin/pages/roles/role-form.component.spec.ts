import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthStore } from '../../../core/stores/auth.store';
import { RoleFormComponent } from './role-form.component';

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'role-1' } } },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.runInInjectionContext(() => {
      component = new RoleFormComponent();
    });
  });

  it('saves edited permissions changed through the custom checkboxes', () => {
    component.ngOnInit();
    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({
      name: { en: 'Editor', ar: '' },
      permissions: [],
      isDefault: false,
    });

    component.togglePermission('dashboard:write', { target: { checked: true } } as unknown as Event);
    expect(component.form.dirty).toBeTrue();

    component.submit();

    const req = http.expectOne(`${environment.apiUrl}roles/role-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.permissions).toContain('dashboard:write');
    req.flush({});
  });

  it('selects and clears every available permission at once', () => {
    component.toggleAllPermissions({ target: { checked: true } } as unknown as Event);
    const allPermissionKeys = component.permissionGroups.flatMap((group) =>
      group.permissions.map((permission) => permission.key),
    );

    expect(component.form.controls.permissions.value).toEqual(allPermissionKeys);
    expect(component.allPermissionsSelected()).toBeTrue();

    component.toggleAllPermissions({ target: { checked: false } } as unknown as Event);
    expect(component.form.controls.permissions.value).toEqual([]);
    expect(component.allPermissionsSelected()).toBeFalse();
  });

  it('selects all permissions for an individual group', () => {
    const categories = component.permissionGroups.find((group) => group.key === 'categories')!;
    component.toggleGroupPermissions(categories, { target: { checked: true } } as unknown as Event);

    expect(component.form.controls.permissions.value).toEqual([
      'categories:read',
      'categories:write',
      'categories:delete',
    ]);
    expect(component.isGroupFullySelected(categories)).toBeTrue();
  });

  it('clears dependent permissions when view permission is removed', () => {
    component.form.controls.permissions.setValue(['products:read', 'products:write', 'products:delete']);
    component.togglePermission('products:read', { target: { checked: false } } as unknown as Event);

    expect(component.form.controls.permissions.value).toEqual([]);
  });

  it('refreshes the signed-in user permissions after updating their role', async () => {
    const auth = TestBed.inject(AuthStore);
    auth.token.set('access-token');
    auth.user.set({
      id: 'user-1',
      _id: 'user-1',
      name: 'Editor',
      email: 'editor@example.com',
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

    component.ngOnInit();
    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({
      name: { en: 'Editor', ar: '' },
      permissions: ['roles:write'],
      isDefault: false,
    });
    component.togglePermission('dashboard:read', { target: { checked: true } } as unknown as Event);
    component.submit();

    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({});
    http.expectOne(`${environment.apiUrl}users/profile`).flush({
      id: 'user-1',
      _id: 'user-1',
      isAdmin: true,
      role: 'role-1',
    });
    await Promise.resolve();
    http.expectOne(`${environment.apiUrl}roles/role-1`).flush({
      id: 'role-1',
      _id: 'role-1',
      name: 'Editor',
      permissions: ['roles:write', 'dashboard:read'],
      isDefault: false,
    });
    await Promise.resolve();

    expect(auth.hasPermission('dashboard:read')).toBeTrue();
  });
});
