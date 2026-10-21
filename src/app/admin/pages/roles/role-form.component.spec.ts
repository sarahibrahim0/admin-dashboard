import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
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
});
