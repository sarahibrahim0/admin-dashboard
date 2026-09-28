import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}2fa`;

  setup(): Observable<{ secret: string; qrCode: string }> {
    return this.http.post<{ secret: string; qrCode: string }>(`${this.url}/setup`, null);
  }

  verify(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/verify`, { token });
  }

  disable(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/disable`, { token });
  }

  getStatus(): Observable<{ enabled: boolean }> {
    return this.http.get<{ enabled: boolean }>(`${this.url}/status`);
  }
}
