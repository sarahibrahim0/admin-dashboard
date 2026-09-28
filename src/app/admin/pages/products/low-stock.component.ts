import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';

const LOW_STOCK_THRESHOLD = 10;

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [TranslatePipe, PageHeaderComponent, BaseTableComponent, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Low Stock' | translate }}" eyebrow="{{ 'Catalog' | translate }}" subtitle="{{ 'Products running low on inventory.' | translate }}">
        <a actions routerLink="/admin/products" class="btn btn-primary"><i class="bi bi-box me-1"></i>{{ 'All Products' | translate }}</a>
      </app-page-header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="card flex items-center gap-4">
          <span class="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-lg text-amber-600"><i class="bi bi-exclamation-triangle"></i></span>
          <div>
            <p class="text-2xl font-bold text-[#18181B]">{{ lowStockCount() }}</p>
            <p class="text-xs text-[#646D77]">{{ 'Low stock' | translate }} (≤ {{ LOW_STOCK_THRESHOLD }})</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <span class="flex h-11 w-11 items-center justify-center rounded-lg bg-red-100 text-lg text-red-600"><i class="bi bi-x-circle"></i></span>
          <div>
            <p class="text-2xl font-bold text-[#18181B]">{{ outOfStockCount() }}</p>
            <p class="text-xs text-[#646D77]">{{ 'Out of stock' | translate }}</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <span class="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-lg text-green-600"><i class="bi bi-check-lg"></i></span>
          <div>
            <p class="text-2xl font-bold text-[#18181B]">{{ restockCost() | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="text-xs text-[#646D77]">{{ 'Est. restock cost' | translate }}</p>
          </div>
        </div>
      </div>

      <app-base-table [columns]="columns" [actions]="actions" [data]="products" [totalCount]="totalCount" [pageSize]="pageSize" [loading]="loading()" [error]="error()" (rowClick)="router.navigate(['/admin/products', $event.id])" (actionClick)="handleAction($event)" />
    </div>
  `,
})
export class LowStockComponent implements OnInit {
  private entityService = inject(EntityService);
  private language = inject(LanguageService);
  protected router = inject(Router);
  products = signal<any[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  readonly LOW_STOCK_THRESHOLD = LOW_STOCK_THRESHOLD;
  lowStockCount = signal(0);
  outOfStockCount = signal(0);
  restockCost = signal(0);

  columns: TableColumn[] = [
    { field: 'image', header: 'Image', imageField: true, width: '80px' },
    { field: 'name', header: 'Name', sortable: true, format: (v) => this.language.localizedValue(v) },
    { field: 'category', header: 'Category', format: (v) => this.language.localizedValue(typeof v === 'object' ? v?.name : v) || '-' },
    { field: 'price', header: 'Price', sortable: true, format: (v) => `$${v?.toFixed(2)}` },
    { field: 'countInStock', header: 'Stock', sortable: true, format: (v) => ({ badge: String(v), badgeClass: v === 0 ? 'bg-red-100 text-red-700' : (v <= LOW_STOCK_THRESHOLD ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700') }) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.entityService.listPaginated<any>('products', { limit: '1000', sortBy: 'dateCreated', sortDir: 'desc' }).subscribe({
      next: (res) => {
        const lowStock = res.data
          .filter((p) => p.countInStock !== undefined && p.countInStock !== null && p.countInStock <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => a.countInStock - b.countInStock);
        this.products.set(lowStock);
        this.totalCount.set(lowStock.length);
        this.lowStockCount.set(lowStock.filter((p) => p.countInStock > 0).length);
        this.outOfStockCount.set(lowStock.filter((p) => p.countInStock === 0).length);
        this.restockCost.set(lowStock.reduce((sum, p) => sum + (LOW_STOCK_THRESHOLD - Math.max(p.countInStock, 0)) * (p.cost ?? p.price ?? 0), 0));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.language.translate('Could not load products'));
        this.loading.set(false);
      },
    });
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/products', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/products', event.row.id, 'edit']);
    }
  }
}