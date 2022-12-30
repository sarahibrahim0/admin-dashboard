import { TestBed } from '@angular/core/testing';
import { CategoriesService } from './categories-service.service';

describe('CategoriesServiceService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
