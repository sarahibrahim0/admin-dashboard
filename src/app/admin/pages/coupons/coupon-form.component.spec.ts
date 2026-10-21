import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { CouponFormComponent } from './coupon-form.component';

describe('CouponFormComponent custom selections', () => {
  let component: CouponFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'coupon-1' } } },
        },
      ],
    });
    TestBed.runInInjectionContext(() => {
      component = new CouponFormComponent();
    });
  });

  it('marks product and category selections as changes', () => {
    const products = document.createElement('select');
    products.multiple = true;
    products.add(new Option('Product', 'product-1', true, true));
    component.onProductsChange({ target: products } as unknown as Event);

    const categories = document.createElement('select');
    categories.multiple = true;
    categories.add(new Option('Category', 'category-1', true, true));
    component.onCategoriesChange({ target: categories } as unknown as Event);

    expect(component.form.pristine).toBeFalse();
    expect(component.form.controls.productIds.value).toEqual(['product-1']);
    expect(component.form.controls.categoryIds.value).toEqual(['category-1']);
  });
});
