import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}export`;

  exportOrders(): Observable<Blob> {
    return this.http.get(`${this.url}/orders`, { responseType: 'blob' });
  }

  exportProducts(): Observable<Blob> {
    return this.http.get(`${this.url}/products`, { responseType: 'blob' });
  }

  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.url}/users`, { responseType: 'blob' });
  }

  download(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
