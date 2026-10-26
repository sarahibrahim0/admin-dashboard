import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService password reset', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests a reset email using the documented endpoint and email body', () => {
    let response: { message: string } | undefined;
    auth.forgotPassword('admin@example.com').subscribe((result) => response = result);

    const request = http.expectOne(`${environment.apiUrl}users/forgot-password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@example.com' });
    request.flush({ message: 'Reset link sent to email' });

    expect(response).toEqual({ message: 'Reset link sent to email' });
  });

  it('submits the reset token and new password using the documented field names', () => {
    let response: { message: string } | undefined;
    auth.resetPassword('reset-token', 'new-password').subscribe((result) => response = result);

    const request = http.expectOne(`${environment.apiUrl}users/reset-password`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'reset-token', newPassword: 'new-password' });
    request.flush({ message: 'Password updated successfully' });

    expect(response).toEqual({ message: 'Password updated successfully' });
  });
});
