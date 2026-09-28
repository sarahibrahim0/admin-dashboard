import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { readTableQuery } from '../../../shared/table/table-query';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Categories' | translate }}" eyebrow="{{ 'Catalog' | translate }}" subtitle="{{ 'Organize products into categories.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Category' | translate }}</a>
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="categories" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/categories', $event.id])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Categories' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected categories?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CategoriesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(10);
  categories = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'image', header: 'Image', imageField: true },
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text', placeholder: 'name', format: (v) => this.language.localizedValue(v) },
    { field: 'icon', header: 'Icon', filterable: true, filterType: 'text', placeholder: 'icon' },
    { field: 'color', header: 'Color', filterable: true, filterType: 'text', placeholder: 'color', format: (v) => v || '-' },
    { field: 'addedOn', header: 'Added on', format: (_v, row) => formatAddedOn(row, [], this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'createdBy', header: 'Added by', format: (v) => this.language.localizedValue(v?.name) || '-' },
    { field: 'isActive', header: 'Status', sortable: true, filterable: true, filterType: 'boolean', format: (v) => ({ badge: v ? 'Active' : 'Inactive', badgeClass: v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }) },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || '_id';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  loadCategories(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 10, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('categories', params),
      (res) => { this.categories.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadCategories(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadCategories(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadCategories(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadCategories(1); }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/categories', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/categories', event.row.id, 'edit']);
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
    this.entityService.deleteBulk('categories', ids).subscribe(() => {
      this.loadCategories();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('categories', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.loadCategories();
        this.selectedIds.set([]); this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}
