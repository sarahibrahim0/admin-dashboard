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
  selector: 'app-countries-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Countries' | translate }}" eyebrow="{{ 'Payments' | translate }}" subtitle="{{ 'Each country has its own currency and the payment methods available to its customers.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Country' | translate }}</a>
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="countries" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/countries', $event.id, 'edit'])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Countries' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected countries?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CountriesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(10);
  countries = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  private currencyMap = new Map<string, string>();

  columns: TableColumn[] = [
    {
      field: 'name', header: 'Country', sortable: true, filterable: true, filterType: 'text', placeholder: 'country',
      format: (v, row) => row?.flag
        ? { badge: row.flag, badgeClass: 'bg-transparent', label: this.language.localizedValue(v) }
        : this.language.localizedValue(v),
    },
    { field: 'code', header: 'Code', sortable: true, filterable: true, filterType: 'text', placeholder: 'code', format: (v) => v || '-' },
    { field: 'phoneCode', header: 'Phone', sortable: true, filterType: 'text', format: (v) => v || '-' },
    {
      field: 'currencyId', header: 'Currency', format: (v) => this.currencyMap.get(v) || idLabel(v),
    },
    {
      field: 'paymentMethods', header: 'Payments', format: (v) => {
        const arr = Array.isArray(v) ? v : [];
        return arr.length
          ? { badge: String(arr.length), badgeClass: 'bg-[#6366F1]10 text-[#6366F1]', label: ' methods' }
          : { badge: '0', badgeClass: 'bg-gray-100 text-gray-500', label: ' methods' };
      },
    },
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
    this.loadCountries();
  }

  private loadCurrencies(): void {
    this.entityService.listPaginated<any>('currencies', { limit: '200', sortBy: 'name', sortDir: 'asc' }).subscribe({
      next: (res) => (res.data || []).forEach((c) => this.currencyMap.set(c._id || c.id, c.code || this.language.localizedValue(c.name))),
      error: () => undefined,
    });
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || '_id';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  loadCountries(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 10, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('countries', params),
      (res) => { this.countries.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadCountries(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadCountries(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadCountries(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadCountries(1); }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/admin/countries', event.row.id, 'edit']);
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
    this.entityService.deleteBulk('countries', ids).subscribe(() => {
      this.loadCountries();
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('countries', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.loadCountries();
        this.selectedIds.set([]); this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}

function idLabel(v: any): string {
  return typeof v === 'string' && v ? v.slice(-4).toUpperCase() : '-';
}