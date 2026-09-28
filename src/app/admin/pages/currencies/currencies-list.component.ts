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
import { formatDateTime } from '../../../shared/utils/datetime';

@Component({
  selector: 'app-currencies-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Currencies' | translate }}" eyebrow="{{ 'Payments' | translate }}" subtitle="{{ 'Currencies used by your countries, with the exchange rate against your base currency.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Currency' | translate }}</a>
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="currencies" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/currencies', $event.id, 'edit'])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Currencies' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected currencies?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CurrenciesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(10);
  currencies = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text', placeholder: 'name', format: (v) => this.language.localizedValue(v) },
    { field: 'code', header: 'Code', sortable: true, filterable: true, filterType: 'text', placeholder: 'code', format: (v) => v || '-' },
    { field: 'symbol', header: 'Symbol', filterable: true, filterType: 'text', placeholder: 'symbol', format: (v) => v || '-' },
    { field: 'countryId', header: 'Country', format: (v) => v ? { badge: `${v.flag || ''} ${this.language.localizedValue(v.name)}`, badgeClass: 'bg-[#6366F1]10 text-[#6366F1]' } : { badge: '—', badgeClass: 'bg-gray-100 text-gray-500' } },
    { field: 'rate', header: 'Rate', sortable: true, format: (v) => Number(v || 1).toFixed(4) },
    { field: 'isDefault', header: 'Base', filterable: true, filterType: 'boolean', format: (v) => v ? { badge: 'Base', badgeClass: 'bg-[#6366F1]10 text-[#6366F1]' } : { badge: '—', badgeClass: 'bg-gray-100 text-gray-500' } },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'isActive', header: 'Status', sortable: true, filterable: true, filterType: 'boolean', format: (v) => ({ badge: v ? 'Active' : 'Inactive', badgeClass: v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }) },
  ];
  actions: TableAction[] = [
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadCurrencies();
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || '_id';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  loadCurrencies(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 10, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('currencies', params),
      (res) => { this.currencies.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadCurrencies(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadCurrencies(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadCurrencies(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadCurrencies(1); }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/currencies', event.row.id, 'edit']);
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
    this.entityService.deleteBulk('currencies', ids).subscribe(() => {
      this.loadCurrencies();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('currencies', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.loadCurrencies();
        this.selectedIds.set([]); this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}