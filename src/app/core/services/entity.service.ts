import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EntityService {
  private http = inject(HttpClient);

  list<T>(endpoint: string, params?: Record<string, string>): Observable<T[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) httpParams = httpParams.set(key, value);
      });
    }
    return this.http.get<T[]>(`${environment.apiUrl}${endpoint}`, { params: httpParams });
  }

  get<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}/${id}`);
  }

  create<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, body);
  }

  update<T>(endpoint: string, id: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${endpoint}/${id}`, body);
  }

  delete(endpoint: string, id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}${endpoint}/${id}`);
  }

  count(endpoint: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}${endpoint}/get/count`);
  }
}
