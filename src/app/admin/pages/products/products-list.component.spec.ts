import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/ui/toast.service';
import { ProductsListComponent } from './products-list.component';

/**
 * The CSV picker is a client-side read rather than a server upload, but it is
 * still a file input on the page: a wrongly-typed or oversized file has to be
 * rejected before it reaches the browser's parser. Uses a real FileReader, so
 * the read path is exercised end to end.
 */
describe('ProductsListComponent CSV import', () => {
  let component: ProductsListComponent;
  let mock: HttpTestingController;
  let toasts: ToastService;

  function csvFile(name: string, content: string, size?: number): File {
    const file = new File([content], name, { type: 'text/csv' });
    if (size !== undefined) Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  function pick(file: File): void {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });
    component.onFileSelected({ target: input } as unknown as Event);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    mock = TestBed.inject(HttpTestingController);
    toasts = TestBed.inject(ToastService);
    TestBed.runInInjectionContext(() => {
      component = new ProductsListComponent();
    });
  });

  it('rejects a file that is not a .csv without reading it', () => {
    pick(csvFile('products.txt', 'a,b\n1,2\n', 10));
    expect(toasts.toasts().some((t) => t.key.includes('.csv file'))).toBeTrue();
  });

  it('rejects a csv larger than 2MB without reading it', () => {
    pick(csvFile('big.csv', 'a,b\n1,2\n', 2 * 1024 * 1024 + 1));
    expect(toasts.toasts().some((t) => t.key.includes('2MB'))).toBeTrue();
  });

  it('rejects a csv that has a header but no data rows', (done) => {
    pick(csvFile('empty.csv', 'name,price,stock\n'));
    setTimeout(() => {
      expect(toasts.toasts().some((t) => t.key === 'CSV has no data rows')).toBeTrue();
      done();
    }, 50);
  });

  it('never touches the media upload endpoints', (done) => {
    pick(csvFile('ok.csv', 'name,price,stock\n'));
    setTimeout(() => {
      mock.expectNone(`${environment.apiUrl}media/image`);
      mock.expectNone(`${environment.apiUrl}media/images`);
      done();
    }, 50);
  });
});
