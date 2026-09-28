import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { LanguageService } from '../../../core/services/language.service';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';
import { readTableQuery } from '../../../shared/table/table-query';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Coupons' | translate }}" eyebrow="{{ 'Marketing' | translate }}" subtitle="{{ 'Manage discounts and promotions.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Coupon' | translate }}</a>
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="coupons" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/coupons', $event.id])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Coupons' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected coupons?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CouponsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  private language = inject(LanguageService);
  coupons = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  pageSize = signal(20);

  columns: TableColumn[] = [
    { field: 'code', header: 'Code', sortable: true, filterable: true, filterType: 'text', placeholder: 'code' },
    { field: 'type', header: 'Type', sortable: true, filterable: true, filterType: 'select', filterOptions: [{ label: 'Percent', value: 'percent' }, { label: 'Fixed', value: 'fixed' }], format: (v) => v === 'percent' ? 'Percent' : 'Fixed' },
    { field: 'value', header: 'Value', sortable: true, filterable: true, filterType: 'number', placeholder: 'value', format: (v, r) => r.type === 'percent' ? `${v}%` : `$${v}` },
    { field: 'minSubtotal', header: 'Min order', sortable: true, filterable: true, filterType: 'number', placeholder: 'min order', format: (v) => !v ? 'None' : v },
    { field: 'usedCount', header: 'Used', sortable: true },
    { field: 'maxUses', header: 'Max Uses', format: (v) => v === 0 ? 'Unlimited' : v },
    { field: 'active', header: 'Status', sortable: true, filterable: true, filterType: 'boolean', format: (v) => ({ badge: v ? 'Active' : 'Inactive', badgeClass: v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }) },
    { field: 'validUntil', header: 'Expires', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'addedOn', header: 'Added on', format: (_v, row) => formatAddedOn(row, ['dateCreated'], this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'createdBy', header: 'Added by', format: (v) => this.language.localizedValue(v?.name) || '-' },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadCoupons();
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || 'dateCreated';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  loadCoupons(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 20, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('coupons', params),
      (res) => { this.coupons.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadCoupons(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadCoupons(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadCoupons(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadCoupons(1); }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/coupons', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/coupons', event.row.id, 'edit']);
    } else if (event.action === 'delete') {
      this.deleteId = event.row.id;
      this.showDeleteDialog.set(true);
    }
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('coupons', ids).subscribe(() => {
      this.loadCoupons();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('coupons', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.loadCoupons();
        this.selectedIds.set([]); this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}
