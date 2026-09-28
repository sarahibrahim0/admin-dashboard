import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  /**
   * List endpoints are inconsistent: some return a bare array, others a
   * `{ data, total, page, totalPages }` envelope. Normalise both into
   * `Paginated<T>` so callers can always read `res.data` / `res.total`.
   */
  private toPaginated<T>(res: Paginated<T> | T[] | null | undefined): Paginated<T> {
    if (Array.isArray(res)) {
      return { data: res, total: res.length, page: 1, totalPages: 1 };
    }
    const envelope = (res ?? {}) as Partial<Paginated<T>>;
    const data = Array.isArray(envelope.data) ? envelope.data : [];
    return {
      data,
      total: typeof envelope.total === 'number' ? envelope.total : data.length,
      page: envelope.page ?? 1,
      totalPages: envelope.totalPages ?? 1,
    };
  }

  listPaginated<T>(endpoint: string, params?: Record<string, string>): Observable<Paginated<T>> {
    return this.http
      .get<Paginated<T> | T[]>(`${environment.apiUrl}${endpoint}`, { params: this.toHttpParams(params) })
      .pipe(map((res) => this.toPaginated<T>(res)));
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
