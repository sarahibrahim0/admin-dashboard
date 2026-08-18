import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mock.verify();
    localStorage.clear();
  });

  it('adds Authorization header when token exists', () => {
    localStorage.setItem('ecom.token', 'test_token');
    http.get('/api/test').subscribe();
    const req = mock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test_token');
    req.flush({});
  });

  it('does not add Authorization header when no token', () => {
    http.get('/api/test').subscribe();
    const req = mock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
