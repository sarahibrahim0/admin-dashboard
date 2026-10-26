import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { EntityService } from '../../../core/services/entity.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { RolesListComponent } from './roles-list.component';

describe('RolesListComponent', () => {
  it('shows the API error in a toast when role deletion fails', () => {
    const deleteRequest = new Subject<unknown>();
    const deleteRole = jasmine.createSpy('delete').and.returnValue(deleteRequest);
    const toastError = jasmine.createSpy('error');
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { keys: [], get: () => null } } },
        },
        { provide: EntityService, useValue: { delete: deleteRole } },
        { provide: ToastService, useValue: { error: toastError } },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new RolesListComponent());
    component.confirmDelete('default-role');

    component.deleteRole();
    deleteRequest.error(new HttpErrorResponse({
      status: 400,
      error: { message: 'cannot delete default role' },
    }));

    expect(toastError).toHaveBeenCalledWith('cannot delete default role');
    expect(component.showDeleteDialog()).toBeFalse();
  });
});
