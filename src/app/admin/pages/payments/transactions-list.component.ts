import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { readTableQuery } from '../../../shared/table/table-query';
import { formatDateTime } from '../../../shared/utils/datetime';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Transactions' | translate }}" eyebrow="{{ 'Payments' | translate }}" subtitle="{{ 'Every payment attempt recorded from the storefront, across all countries.' | translate }}">
        <a actions routerLink="/admin/payments/methods" class="btn btn-secondary"><i class="bi bi-wallet2"></i>{{ 'Payment Methods' | translate }}</a>
      </app-page-header>
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="transactions" [totalCount]="totalCount" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" />
    </div>
  `,
})
export class TransactionsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(10);
  transactions = signal<any[]>([]);
  totalCount = signal(0);

  columns: TableColumn[] = [
    {
      field: 'reference', header: 'Reference', sortable: true, filterable: true, filterType: 'text', placeholder: 'reference',
      format: (v, row) => v || shortId(row._id || row.id),
    },
    {
      field: 'orderId', header: 'Order', format: (v) => {
        const s = String(v || '');
        return s ? '#' + s.slice(-8).toUpperCase() : '-';
      },
    },
    {
      field: 'customer', header: 'Customer', filterable: true, filterType: 'text', placeholder: 'customer',
      format: (v, row) => this.language.localizedValue(v?.name) || this.language.localizedValue(row.user?.name) || '-',
    },
    {
      field: 'method', header: 'Method', filterable: true, filterType: 'text', placeholder: 'method',
      format: (v) => this.language.localizedValue(v?.name) || v || v?.code || '-',
    },
    {
      field: 'amount', header: 'Amount', sortable: true,
      format: (v, row) => money(row.amount ?? v, row.currency),
    },
    {
      field: 'status', header: 'Status', sortable: true, filterable: true, filterType: 'select',
      filterOptions: ['pending', 'paid', 'failed', 'refunded'].map((s) => ({ label: s, value: s })),
      format: (v) => statusBadge(v),
    },
    { field: 'createdAt', header: 'Date', sortable: true, format: (v, row) => formatDateTime(v || row.dateOrdered || row.date, this.language.language()) },
  ];
  actions: TableAction[] = [];

  ngOnInit(): void {
    this.loadTransactions();
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || '_id';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  loadTransactions(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 10, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('transactions', params),
      (res) => { this.transactions.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadTransactions(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadTransactions(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadTransactions(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadTransactions(1); }
}

function shortId(v: any): string {
  const s = String(v || '');
  return s ? '…' + s.slice(-8).toUpperCase() : '-';
}

function money(v: any, currency?: string): string {
  const n = Number(v || 0).toFixed(2);
  const cur = String(currency || '').trim();
  return cur ? `${cur} ${n}` : `$${n}`;
}

function statusBadge(v: any): any {
  const status = String(v || 'pending').toLowerCase();
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    completed: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    succeeded: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    waiting: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    failed: { label: 'Failed', cls: 'bg-red-100 text-red-700' },
    rejected: { label: 'Failed', cls: 'bg-red-100 text-red-700' },
    refunded: { label: 'Refunded', cls: 'bg-blue-100 text-blue-700' },
  };
  const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return { badge: m.label, badgeClass: m.cls };
}