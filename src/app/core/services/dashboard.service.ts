import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalReviews: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageOrderValue: number;
  averageRating?: number;
  ordersByStatus: { status: string; count: number }[];
  paymentStatusBreakdown: { status: string; count: number }[];
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  product: { id: string; name: string; price: number; image: any } | null;
  totalSold: number;
}

export interface CategoryDist {
  category: { id: string; name: string };
  count: number;
}

export interface ReviewsSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}dashboard`;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/summary`);
  }

  getRevenueOverTime(period = 'day', days = 30, startDate?: string, endDate?: string): Observable<RevenuePoint[]> {
    let params: any = { period, days: String(days) };
    if (startDate) params = { ...params, startDate };
    if (endDate) params = { ...params, endDate };
    return this.http.get<RevenuePoint[]>(`${this.base}/revenue-over-time`, { params });
  }

  getTopProducts(limit = 10): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.base}/top-products`, { params: { limit: String(limit) } });
  }

  getCategoryDistribution(): Observable<CategoryDist[]> {
    return this.http.get<CategoryDist[]>(`${this.base}/category-distribution`);
  }

  getReviewsSummary(): Observable<ReviewsSummary> {
    return this.http.get<ReviewsSummary>(`${this.base}/reviews-summary`);
  }

  getRecentOrders(limit = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/recent-orders`, { params: { limit: String(limit) } });
  }

  getUserGrowth(period: string = 'day', days: number = 30): Observable<{ date: string; count: number }[]> {
    return this.http.get<{ date: string; count: number }[]>(`${this.base}/user-growth`, { params: { period, days: String(days) } });
  }

  getTopProductsChart(limit: number = 10): Observable<{ name: string; totalSold: number; revenue: number }[]> {
    return this.http.get<{ name: string; totalSold: number; revenue: number }[]>(`${this.base}/top-products-chart`, { params: { limit: String(limit) } });
  }
}
