import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardSummary, RevenuePoint, CategoryDist } from '../../../core/services/dashboard.service';
import { KpiCardComponent } from './kpi-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">Dashboard</h2>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <app-kpi-card label="Revenue" [value]="'$' + formatNumber(summary()?.totalRevenue || 0)" icon="pi pi-dollar" iconBg="bg-green-100" iconColor="text-green-600" />
          <app-kpi-card label="Orders" [value]="summary()?.totalOrders || 0" icon="pi pi-shopping-cart" iconBg="bg-blue-100" iconColor="text-blue-600" />
          <app-kpi-card label="Products" [value]="summary()?.totalProducts || 0" icon="pi pi-box" iconBg="bg-purple-100" iconColor="text-purple-600" />
          <app-kpi-card label="Users" [value]="summary()?.totalUsers || 0" icon="pi pi-users" iconBg="bg-amber-100" iconColor="text-amber-600" />
          <app-kpi-card label="Pending" [value]="summary()?.pendingOrders || 0" subtitle="orders awaiting processing" icon="pi pi-clock" iconBg="bg-orange-100" iconColor="text-orange-600" />
          <app-kpi-card label="Low Stock" [value]="summary()?.lowStockProducts || 0" subtitle="items with ≤10 stock" icon="pi pi-exclamation-triangle" iconBg="bg-rose-100" iconColor="text-rose-600" />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Revenue Chart Placeholder -->
          <div class="rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="mb-4 text-lg font-semibold text-slate-900">Revenue Over Time</h3>
            <div class="flex h-64 items-center justify-center text-sm text-slate-400">
              Chart placeholder — revenue data: {{ revenueData().length }} points
            </div>
          </div>

          <!-- Status Chart Placeholder -->
          <div class="rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="mb-4 text-lg font-semibold text-slate-900">Orders by Status</h3>
            <div class="space-y-2">
              @for (item of summary()?.ordersByStatus || []; track item.status) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600">{{ item.status }}</span>
                  <span class="font-medium text-slate-900">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Category Chart Placeholder -->
          <div class="rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="mb-4 text-lg font-semibold text-slate-900">Products by Category</h3>
            <div class="space-y-2">
              @for (item of categoryData(); track item.category.id) {
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600">{{ item.category.name }}</span>
                  <span class="font-medium text-slate-900">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Reviews Summary -->
          <div class="rounded-lg border border-slate-200 bg-white p-6">
            <h3 class="mb-4 text-lg font-semibold text-slate-900">Reviews Summary</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Total Reviews</span><span class="font-medium">{{ summary()?.totalReviews || 0 }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Average Rating</span><span class="font-medium">{{ avgRating().toFixed(1) }} ★</span></div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="rounded-lg border border-slate-200 bg-white p-6">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">Recent Orders</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th class="pb-2">Customer</th>
                  <th class="pb-2">Total</th>
                  <th class="pb-2">Status</th>
                  <th class="pb-2">Payment</th>
                  <th class="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders(); track order.id) {
                  <tr class="border-b border-slate-100">
                    <td class="py-2">{{ order.user?.name || order.user?.email || '-' }}</td>
                    <td class="py-2">\${{ order.totalPrice?.toFixed(2) }}</td>
                    <td class="py-2">
                      <span class="rounded-full px-2 py-0.5 text-xs font-medium"
                        [class.bg-amber-100]="order.status === 'Pending'"
                        [class.text-amber-700]="order.status === 'Pending'"
                        [class.bg-green-100]="order.status === 'Processed'"
                        [class.text-green-700]="order.status === 'Processed'"
                        [class.bg-red-100]="order.status === 'Cancelled'"
                        [class.text-red-700]="order.status === 'Cancelled'">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="py-2">{{ order.paymentStatus }}</td>
                    <td class="py-2">{{ order.dateOrdered | date:'shortDate' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="py-4 text-center text-slate-500">No orders yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  revenueData = signal<RevenuePoint[]>([]);
  categoryData = signal<CategoryDist[]>([]);
  recentOrders = signal<any[]>([]);
  avgRating = signal(0);
  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.avgRating.set(data.totalReviews > 0 ? (data as any).averageRating || 0 : 0);
      },
      error: () => {},
    });

    this.dashboardService.getRevenueOverTime('day', 30).subscribe({
      next: (data) => this.revenueData.set(data),
      error: () => {},
    });

    this.dashboardService.getCategoryDistribution().subscribe({
      next: (data) => this.categoryData.set(data),
      error: () => {},
    });

    this.dashboardService.getReviewsSummary().subscribe({
      next: (data) => this.avgRating.set(data.averageRating),
      error: () => {},
    });

    this.dashboardService.getRecentOrders(10).subscribe({
      next: (data) => {
        this.recentOrders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toFixed(2);
  }
}
