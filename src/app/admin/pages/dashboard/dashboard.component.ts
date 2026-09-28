import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DashboardService, DashboardSummary, RevenuePoint, CategoryDist } from '../../../core/services/dashboard.service';
import { LanguageService } from '../../../core/services/language.service';
import { formatDateTime } from '../../../shared/utils/datetime';
import { KpiCardComponent } from './kpi-card.component';
import { RevenueChartComponent } from './revenue-chart.component';
import { CategoryChartComponent } from './category-chart.component';
import { StatusChartComponent } from './status-chart.component';
import { OrdersChartComponent } from './orders-chart.component';
import { PeriodSelectorComponent } from './period-selector.component';
import { UserGrowthChartComponent } from './user-growth-chart.component';
import { TopProductsChartComponent } from './top-products-chart.component';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, KpiCardComponent, RevenueChartComponent, CategoryChartComponent, StatusChartComponent, OrdersChartComponent, PeriodSelectorComponent, UserGrowthChartComponent, TopProductsChartComponent, BaseTableComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b border-[#eadbd4] pb-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#797979]">{{ 'Overview' | translate }}</p>
          <h2 class="mt-1 text-2xl font-bold uppercase text-blue-black">{{ 'Dashboard' | translate }}</h2>
        </div>
        <span class="text-sm text-[#797979]">{{ 'Live store metrics' | translate }}</span>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-salmon border-t-transparent"></div>
        </div>
      } @else {
        <section>
          <div class="mb-4 flex items-end justify-between border-b border-[#eadbd4] pb-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#797979]">{{ 'At a glance' | translate }}</p>
              <h3 class="mt-1 text-xl font-semibold text-blue-black">{{ 'Key metrics' | translate }}</h3>
            </div>
            <span class="text-xs uppercase tracking-wider text-[#797979]">{{ 'Store performance' | translate }}</span>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <app-kpi-card label="Revenue" [value]="'$' + formatNumber(summary()?.totalRevenue || 0)" icon="dollar" />
            <app-kpi-card label="Orders" [value]="summary()?.totalOrders || 0" icon="shopping-cart" />
            <app-kpi-card label="Products" [value]="summary()?.totalProducts || 0" icon="box" />
            <app-kpi-card label="Users" [value]="summary()?.totalUsers || 0" icon="users" />
            <app-kpi-card label="Pending" [value]="summary()?.pendingOrders || 0" subtitle="orders awaiting processing" icon="clock" iconBg="bg-amber-50" iconColor="text-amber-700" />
            <app-kpi-card label="Low Stock" [value]="summary()?.lowStockProducts || 0" subtitle="items with ≤10 stock" icon="exclamation-triangle" iconBg="bg-red-50" iconColor="text-[#D92D20]" />
          </div>
        </section>

        <section class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#eadbd4] bg-white px-4 py-3 sm:px-6">
          <div>
            <h3 class="text-lg font-semibold uppercase text-blue-black">{{ 'Performance' | translate }}</h3>
            <p class="text-sm text-[#797979]">{{ 'Track your store activity over time.' | translate }}</p>
          </div>
          <app-period-selector (periodChange)="onPeriodChange($event)" />
        </section>

        <section class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
          <app-revenue-chart [data]="revenueData()" />
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <app-status-chart [data]="summary()?.ordersByStatus ?? emptyOrdersByStatus" />
            <div class="rounded-lg border border-border bg-white p-6">
              <div class="mb-5 flex items-center justify-between">
                <h3 class="text-lg font-semibold uppercase text-blue-black">{{ 'Reviews' | translate }}</h3>
                <span class="text-2xl font-bold text-primary">{{ avgRating().toFixed(1) }} ★</span>
              </div>
              <div class="flex items-end justify-between border-t border-border pt-4">
                <span class="text-sm text-[#797979]">{{ 'Total reviews' | translate }}</span>
                <span class="font-semibold text-blue-black">{{ summary()?.totalReviews || 0 }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <app-category-chart [data]="categoryData()" />
          <app-orders-chart [data]="revenueData()" />
          <app-user-growth-chart [data]="userGrowthData()" />
          <app-top-products-chart [data]="topProductsData()" />
        </section>

        <!-- Recent Orders -->
        <div class="rounded-lg border border-border bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold uppercase text-blue-black">{{ 'Recent Orders' | translate }}</h3>
          <app-base-table [columns]="recentColumns" [data]="recentOrders" [totalCount]="recentCount" [showSearch]="false" [serverSidePagination]="false" [pageSize]="recentPageSize" />
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  private language = inject(LanguageService);
  readonly emptyOrdersByStatus: { status: string; count: number }[] = [];

  constructor() {
    // Some dashboard strings (e.g. top-product names) are localized by the
    // backend per the `x-language` header, so reload on toggle — not just
    // re-render — to show the correct language data.
    effect(() => {
      this.language.language();
      this.loadData();
    });
  }

  summary = signal<DashboardSummary | null>(null);
  revenueData = signal<RevenuePoint[]>([]);
  categoryData = signal<CategoryDist[]>([]);
  recentOrders = signal<any[]>([]);
  avgRating = signal(0);
  loading = signal(true);
  userGrowthData = signal<{ date: string; count: number }[]>([]);
  topProductsData = signal<{ name: string; totalSold: number; revenue: number }[]>([]);
  selectedPeriod = signal('day');

  localized(v: any): string {
    return this.language.localizedValue(v);
  }

  formatDate(value: unknown): string {
    return formatDateTime(value, this.language.language());
  }

  readonly recentCount = computed(() => this.recentOrders().length);
  readonly recentPageSize = signal(100);

  recentColumns: TableColumn[] = [
    { field: 'user', header: 'Customer', format: (v) => this.localized(v?.name) || v?.email || '-' },
    { field: 'totalPrice', header: 'Total', format: (v) => `$${v?.toFixed(2)}` },
    {
      field: 'status',
      header: 'Status',
      format: (v) => ({ badge: v, badgeClass: this.orderStatusBadge(v) }),
    },
    { field: 'paymentStatus', header: 'Payment' },
    { field: 'dateOrdered', header: 'Date', format: (v) => this.formatDate(v) },
  ];

  orderStatusBadge(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Processed': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-purple-100 text-purple-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-[#F6F8FE] text-[#797979]';
    }
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      summary: this.dashboardService.getSummary().pipe(catchError(() => of(null))),
      revenue: this.dashboardService.getRevenueOverTime('day', 30).pipe(catchError(() => of([]))),
      categories: this.dashboardService.getCategoryDistribution().pipe(catchError(() => of([]))),
      reviews: this.dashboardService.getReviewsSummary().pipe(catchError(() => of(null))),
      recentOrders: this.dashboardService.getRecentOrders(10).pipe(catchError(() => of([]))),
      userGrowth: this.dashboardService.getUserGrowth('day', 30).pipe(catchError(() => of([]))),
      topProducts: this.dashboardService.getTopProductsChart(10).pipe(catchError(() => of([]))),
    }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe(({ summary, revenue, categories, reviews, recentOrders, userGrowth, topProducts }) => {
      if (summary) {
        this.summary.set(summary);
        this.avgRating.set(summary.totalReviews > 0 ? summary.averageRating || 0 : 0);
      }
      if (reviews) this.avgRating.set(reviews.averageRating);
      this.revenueData.set(revenue);
      this.categoryData.set(categories);
      this.recentOrders.set(recentOrders);
      this.userGrowthData.set(userGrowth);
      this.topProductsData.set(topProducts);
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    this.loadRevenueAndOrders(period);
    this.loadUserGrowth(period);
  }

  loadRevenueAndOrders(period: string): void {
    this.dashboardService.getRevenueOverTime(period, 30).subscribe({
      next: (data) => this.revenueData.set(data),
      error: (err) => console.error('Failed to load revenue-over-time:', err),
    });
  }

  loadUserGrowth(period: string = 'day'): void {
    this.dashboardService.getUserGrowth(period, 30).subscribe({
      next: (data) => this.userGrowthData.set(data),
      error: (err) => console.error('Failed to load user-growth:', err),
    });
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toFixed(2);
  }
}
