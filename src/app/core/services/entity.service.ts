import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/ui/toast.service';

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class EntityService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private toHttpParams(params?: Record<string, string>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) httpParams = httpParams.set(key, value);
      });
    }
    return httpParams;
  }

  buildQueryParams(q: ListQueryParams = {}): Record<string, string> {
    const params: Record<string, string> = {};
    if (q.page) params['page'] = String(q.page);
    if (q.limit) params['limit'] = String(q.limit);
    if (q.sortBy) params['sortBy'] = q.sortBy;
    if (q.sortDir) params['sortDir'] = q.sortDir;
    if (q.search) params['search'] = q.search;
    if (q.filter && Object.keys(q.filter).some((k) => q.filter![k] !== '')) {
      params['filter'] = JSON.stringify(q.filter);
    }
    return params;
  }

  list<T>(endpoint: string, params?: Record<string, string>): Observable<T[]> {
    return this.http.get<T[]>(`${environment.apiUrl}${endpoint}`, { params: this.toHttpParams(params) });
  }

  listPaginated<T>(endpoint: string, params?: Record<string, string>): Observable<Paginated<T>> {
    return this.http.get<Paginated<T>>(`${environment.apiUrl}${endpoint}`, { params: this.toHttpParams(params) });
  }

  get<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}/${id}`);
  }

  getRoot<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}`);
  }

  create<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, body);
  }

  update<T>(endpoint: string, id: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${endpoint}/${id}`, body);
  }

  updateRoot<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${endpoint}`, body);
  }

  delete(endpoint: string, id: string): Observable<any> {
    return this.http
      .delete(`${environment.apiUrl}${endpoint}/${id}`)
      .pipe(tap(() => this.toast.success('Deleted successfully')));
  }

  deleteBulk(endpoint: string, ids: string[]): Observable<any> {
    return this.http
      .request('delete', `${environment.apiUrl}${endpoint}`, { body: { ids } })
      .pipe(tap(() => this.toast.success('Deleted successfully')));
  }

  count(endpoint: string): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${environment.apiUrl}${endpoint}/get/count`);
  }
}
