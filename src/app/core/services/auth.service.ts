import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, RegisterRequest, User } from '../models';

/** Some deployments wrap single records in `{ data }` / `{ user }`; unwrap so callers always get the user. */
function unwrapUser(res: any): User {
  return (res?.data ?? res?.user ?? res) as User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}users`;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { email, password });
  }

  register(body: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.base}/register`, body);
  }

  me(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`).pipe(map(unwrapUser));
  }

  profile(): Observable<User> {
    return this.http.get<User>(`${this.base}/profile`).pipe(map(unwrapUser));
  }

  refresh(refreshToken: string): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${environment.apiUrl}auth/refresh`,
      { refreshToken },
    );
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}auth/logout`,
      { refreshToken },
    );
  }

  verifyEmail(userId: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/verify-email`, { userId, code });
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, { token, newPassword: password });
  }
}
