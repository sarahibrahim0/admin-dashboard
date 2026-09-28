import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { LanguageService } from '../../../core/services/language.service';
import { formatDateTime } from '../../../shared/utils/datetime';
import { readTableQuery } from '../../../shared/table/table-query';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Orders' | translate }}" eyebrow="{{ 'Sales' | translate }}" subtitle="{{ 'Track and manage customer orders.' | translate }}"></app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="orders" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/orders', $event.id])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Orders' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected orders?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class OrdersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(20);
  orders = signal<any[]>([]);
  totalCount = signal(0);
  statusFilter = '';
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'id', header: 'Order ID', width: '120px', format: (v) => v?.slice(-8) },
    { field: 'user', header: 'Customer', format: (v) => this.language.localizedValue(v?.name) || v?.email || '-' },
    { field: 'totalPrice', header: 'Total', sortable: true, filterable: true, filterType: 'number', placeholder: 'total', format: (v) => `$${v?.toFixed(2)}` },
    { field: 'status', header: 'Status', sortable: true, filterable: true, filterType: 'select', filterOptions: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => ({ label: s, value: s })) },
    { field: 'paymentStatus', header: 'Payment', sortable: true, filterable: true, filterType: 'select', filterOptions: ['Pending', 'Paid', 'Failed', 'Refunded'].map((s) => ({ label: s, value: s })) },
    { field: 'dateOrdered', header: 'Date', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
  deleteId: string | null = null;

  ngOnInit(): void {
    this.entityService.getRoot<any>('orders/statuses').subscribe({
      next: (meta) => {
        if (Array.isArray(meta.statuses)) {
          const col = this.columns.find((c) => c.field === 'status');
          if (col) col.filterOptions = meta.statuses.map((s: string) => ({ label: s, value: s }));
        }
      },
      error: () => undefined,
    });
    this.loadOrders();
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view' || event.action === 'edit') {
      this.router.navigate(['/admin/orders', event.row.id]);
    } else if (event.action === 'delete') {
      this.deleteId = event.row.id;
      this.showDeleteDialog.set(true);
    }
  }

  loadOrders(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 20, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('orders', params),
      (res) => { this.orders.set(res.data); this.totalCount.set(res.total); },
    );
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || 'dateOrdered';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  onSearch(query: string): void {
    this.search = query;
    this.loadOrders(1);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders(page);
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    this.sortBy = event.field;
    this.sortDir = event.dir;
    this.loadOrders(1);
  }

  onFilter(filters: Record<string, string>): void {
    this.filters = filters;
    this.loadOrders(1);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('orders', ids).subscribe(() => {
      this.tableRef()?.resetPage();
      this.loadOrders();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('orders', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.tableRef()?.resetPage();
        this.loadOrders();
        this.selectedIds.set([]);
        this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}
