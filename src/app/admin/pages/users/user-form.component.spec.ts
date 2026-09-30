import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UserFormComponent } from './user-form.component';
import { AuthStore } from '../../../core/stores/auth.store';

describe('UserFormComponent role assignment', () => {
  let component: UserFormComponent;
  let http: HttpTestingController;
  let isAdmin: boolean;

  function signInAsAdmin(): void {
    isAdmin = true;
  }

  beforeEach(() => {
    isAdmin = false;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isAdmin: () => isAdmin,
            userId: () => 'other',
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.runInInjectionContext(() => {
      component = new UserFormComponent();
    });
  });

  function createAndLoadRoles(): void {
    component.ngOnInit();
    const req = http.expectOne(`${environment.apiUrl}roles`);
    req.flush([
      { id: 'r1', name: { en: 'Editor', ar: 'محرر' } },
      { id: 'r2', name: 'Support' },
    ]);
  }

  it('does not request the role list for a non-admin', () => {
    component.ngOnInit();
    http.expectNone(`${environment.apiUrl}roles`);
    expect(component.roles()).toEqual([]);
  });

  it('loads roles and resolves localized names for the dropdown', () => {
    signInAsAdmin();
    createAndLoadRoles();

    expect(component.roles().length).toBe(2);
    // Names arrive localized; the label has to be readable in the active
    // language rather than "[object Object]".
    expect(component.roleName(component.roles()[0])).toBeTruthy();
    expect(component.roleName(component.roles()[0])).not.toBe('[object Object]');
  });

  it('sends the selected role and admin flag when an admin saves', () => {
    signInAsAdmin();
    createAndLoadRoles();

    component.form.patchValue({ nameEn: 'Sara', email: 'sara@example.com', phone: '0100', role: 'r2' });
    component.form.markAsDirty();
    component.submit();

    const req = http.expectOne(`${environment.apiUrl}users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.role).toBe('r2');
    expect(req.request.body.isAdmin).toBeFalse();
    req.flush({});
  });

  it('never sends role or isAdmin when the viewer is not an admin', () => {
    // The backend rejects those fields from a non-admin with 403, so the form
    // must not include them at all.
    component.form.patchValue({ nameEn: 'Sara', email: 'sara@example.com', phone: '0100', role: 'r1', isAdmin: true });
    component.form.markAsDirty();
    component.submit();

    const req = http.expectOne(`${environment.apiUrl}users`);
    expect('role' in req.request.body).toBeFalse();
    expect('isAdmin' in req.request.body).toBeFalse();
    req.flush({});
  });

  it('sends null rather than an empty string to clear a role', () => {
    signInAsAdmin();
    createAndLoadRoles();

    component.form.patchValue({ nameEn: 'Sara', email: 'sara@example.com', phone: '0100', role: '' });
    component.form.markAsDirty();
    component.submit();

    const req = http.expectOne(`${environment.apiUrl}users`);
    expect(req.request.body.role).toBeNull();
    req.flush({});
  });

  it('surfaces the backend rejection when a non-admin tries to change a role', () => {
    component.form.patchValue({ nameEn: 'Sara', email: 'sara@example.com', phone: '0100' });
    component.form.markAsDirty();
    component.submit();

    const req = http.expectOne(`${environment.apiUrl}users`);
    req.flush({ message: 'only an admin can change role' }, { status: 403, statusText: 'Forbidden' });

    expect(component.submitError()).toContain('only an admin can change role');
  });
});
