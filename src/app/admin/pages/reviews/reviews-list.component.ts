import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { formatDateTime } from '../../../shared/utils/datetime';
import { readTableQuery } from '../../../shared/table/table-query';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Reviews' | translate }}" eyebrow="{{ 'Feedback' | translate }}" subtitle="{{ 'Monitor customer feedback.' | translate }}"></app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="reviews" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (actionClick)="handleAction($event)" />
    </div>

    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Reviews' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected reviews?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />

    @if (viewingReview(); as review) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold uppercase text-blue-black">{{ review.rating }} ★ {{ 'Review' | translate }}</h3>
              <p class="mt-1 text-sm text-[#646D77]">{{ language.localizedValue(review.user?.name) || review.user?.email || '-' }} · {{ language.localizedValue(review.product?.name) || '-' }}</p>
            </div>
            <button (click)="viewingReview.set(null)" class="p-1 text-[#797979] hover:text-salmon"><i class="bi bi-x-lg"></i></button>
          </div>
          <p class="mt-4 whitespace-pre-wrap text-sm text-[#646D77]">{{ review.comment || '-' }}</p>
          <p class="mt-4 text-xs text-[#797979]">{{ formatDate(review.dateCreated) }}</p>
          <div class="mt-6 flex justify-end">
            <button (click)="viewingReview.set(null)" class="btn btn-secondary">{{ 'Close' | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReviewsListComponent implements OnInit {
  private entityService = inject(EntityService);
  private route = inject(ActivatedRoute);
  protected loader = new LatestLoader();
  protected language = inject(LanguageService);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(10);
  reviews = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;
  viewingReview = signal<any | null>(null);

  formatDate(value: unknown): string {
    return formatDateTime(value, this.language.language());
  }

  columns: TableColumn[] = [
    { field: 'user', header: 'User', format: (v) => this.language.localizedValue(v?.name) || v?.email || '-' },
    { field: 'product', header: 'Product', format: (v) => this.language.localizedValue(v?.name) || '-' },
    { field: 'rating', header: 'Rating', sortable: true, filterable: true, filterType: 'number', placeholder: 'rating', format: (v) => `${v} ★` },
    { field: 'comment', header: 'Comment', filterable: true, filterType: 'text', placeholder: 'comment', format: (v) => v || '-' },
    { field: 'dateCreated', header: 'Date', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'isActive', header: 'Status', sortable: true, filterable: true, filterType: 'boolean', format: (v) => ({ badge: v ? 'Active' : 'Inactive', badgeClass: v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }) },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];

  ngOnInit(): void {
    this.loadReviews();
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.viewingReview.set(event.row);
    } else if (event.action === 'delete') {
      this.deleteId = event.row.id;
      this.showDeleteDialog.set(true);
    }
  }

  loadReviews(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 10, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('reviews', params),
      (res) => { this.reviews.set(res.data); this.totalCount.set(res.total); },
    );
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || 'dateCreated';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  onSearch(query: string): void {
    this.search = query;
    this.loadReviews(1);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews(page);
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    this.sortBy = event.field;
    this.sortDir = event.dir;
    this.loadReviews(1);
  }

  onFilter(filters: Record<string, string>): void {
    this.filters = filters;
    this.loadReviews(1);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('reviews', ids).subscribe(() => {
      this.tableRef()?.resetPage();
      this.loadReviews();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('reviews', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.tableRef()?.resetPage();
        this.loadReviews();
        this.selectedIds.set([]);
        this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}