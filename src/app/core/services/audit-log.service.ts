import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  user: { _id: string; name: string; email: string };
  changes: any;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}audit-logs`;

  getLogs(page = 1, limit = 50, entity?: string, action?: string, search?: string): Observable<AuditLogResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (entity) params = params.set('entity', entity);
    if (action) params = params.set('action', action);
    if (search) params = params.set('search', search);
    return this.http.get<AuditLogResponse>(this.url, { params });
  }

  getMyLogs(page = 1, limit = 50, entity?: string, action?: string, sortBy?: string, sortDir?: string, search?: string): Observable<AuditLogResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (entity) params = params.set('entity', entity);
    if (action) params = params.set('action', action);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDir) params = params.set('sortDir', sortDir);
    if (search) params = params.set('search', search);
    return this.http.get<AuditLogResponse>(`${this.url}/my`, { params });
  }

  getEntities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/entities`);
  }
}
