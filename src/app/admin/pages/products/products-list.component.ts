import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { LanguageService } from '../../../core/services/language.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { readTableQuery } from '../../../shared/table/table-query';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Products' | translate }}" eyebrow="{{ 'Catalog' | translate }}" subtitle="{{ 'Manage your product catalog.' | translate }}">
        <button actions type="button" (click)="exportCsv()" class="btn btn-ghost" [disabled]="products().length === 0"><i class="bi bi-download me-1"></i>{{ 'Export CSV' | translate }}</button>
        <button actions type="button" (click)="fileInput.click()" class="btn btn-ghost"><i class="bi bi-upload me-1"></i>{{ 'Import CSV' | translate }}</button>
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Product' | translate }}</a>
        <input #fileInput type="file" accept=".csv,text/csv" class="hidden" (change)="onFileSelected($event)" />
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="products" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/products', $event.id])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Products' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected products?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ProductsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(20);
  products = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;
  private categoryIdMap = new Map<string, string>();

  columns: TableColumn[] = [
    { field: 'image', header: 'Image', imageField: true, width: '80px' },
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text', placeholder: 'name', format: (v) => this.language.localizedValue(v) },
    { field: 'price', header: 'Price', sortable: true, filterable: true, filterType: 'number', placeholder: 'price', format: (v) => `$${v?.toFixed(2)}` },
    { field: 'category', header: 'Category', format: (v) => this.language.localizedValue(typeof v === 'object' ? v?.name : v) || '-' },
    { field: 'countInStock', header: 'Stock', sortable: true, filterable: true, filterType: 'number', placeholder: 'stock' },
    { field: 'rating', header: 'Rating', sortable: true, filterable: true, filterType: 'number', placeholder: 'rating', format: (v) => `${v?.toFixed(1)} ★` },
    { field: 'isFeatured', header: 'Featured', filterable: true, filterType: 'boolean', format: (v) => v ? 'Yes' : 'No' },
    { field: 'addedOn', header: 'Added on', format: (_v, row) => formatAddedOn(row, ['dateCreated'], this.language.language()) },
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

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.entityService.listPaginated<any>('categories', { limit: '500' }).subscribe({
      next: (res) => {
        for (const c of res.data) {
          this.categoryIdMap.set(this.language.localizedValue(c.name).trim().toLowerCase(), c._id);
        }
      },
      error: () => undefined,
    });
  }

  exportCsv(): void {
    const rows = this.products();
    if (rows.length === 0) { this.toast.info('No products to export'); return; }
    const esc = (v: any): string => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = ['name', 'nameAr', 'price', 'stock', 'categoryName', 'brand', 'brandAr', 'color', 'isFeatured', 'isActive'];
    const lines = [header.join(',')];
    for (const p of rows) {
      const name = p.name || {};
      const brand = p.brand || {};
      const cat = typeof p.category === 'object' ? p.category : undefined;
      lines.push([
        esc(name.en), esc(name.ar), esc(p.price), esc(p.countInStock),
        esc(this.language.localizedValue(cat?.name)), esc(brand.en), esc(brand.ar),
        esc(p.color), esc(p.isFeatured), esc(p.isActive),
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.importRows(this.parseCsv(String(reader.result || '')));
    reader.readAsText(file);
    input.value = '';
  }

  private parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else { field += ch; }
      } else if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some((c) => c.trim() !== '')) rows.push(row);
        row = [];
      } else { field += ch; }
    }
    row.push(field);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
    return rows;
  }

  private importRows(rows: string[][]): void {
    if (rows.length < 2) { this.toast.error('CSV has no data rows'); return; }
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string): number => header.indexOf(name);
    const queue = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ''));
    let created = 0;
    let failed = 0;
    const run = (i: number): void => {
      if (i >= queue.length) {
        this.toast.success(`${created} products imported, ${failed} failed`);
        this.loadProducts();
        return;
      }
      const r = queue[i];
      const catName = (r[idx('categoryname')] ?? '').trim().toLowerCase();
      const body: any = {
        name: { en: r[idx('name')] ?? '', ar: r[idx('namear')] ?? '' },
        description: { en: '', ar: '' },
        price: Number(r[idx('price')]) || 0,
        countInStock: Number(r[idx('stock')]) || 0,
        brand: { en: r[idx('brand')] ?? '', ar: r[idx('brandar')] ?? '' },
        color: r[idx('color')] ?? '',
        isFeatured: (r[idx('isfeatured')] ?? '').toLowerCase() === 'true',
        isActive: (r[idx('isactive')] ?? '').toLowerCase() !== 'false',
      };
      const categoryId = this.categoryIdMap.get(catName);
      if (categoryId) body.category = categoryId;
      this.entityService.create<any>('products', body).subscribe({
        next: () => { created++; run(i + 1); },
        error: () => { failed++; run(i + 1); },
      });
    };
    run(0);
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/products', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/products', event.row.id, 'edit']);
    } else if (event.action === 'delete') {
      this.deleteId = event.row.id;
      this.showDeleteDialog.set(true);
    }
  }

  loadProducts(page = this.currentPage): void {
    // Aborts the previous in-flight search so typing a name never stacks requests.
    this.loader.load(
      this.entityService.listPaginated<any>('products', this.buildParams(page)),
      (res) => { this.products.set(res.data); this.totalCount.set(res.total); },
    );
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || 'dateCreated';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  private buildParams(page: number): Record<string, string> {
    const params = this.entityService.buildQueryParams({
      page,
      limit: 20,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.search,
      filter: this.filters,
    });
    return params;
  }

  onSearch(query: string): void {
    this.search = query;
    this.loadProducts(1);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts(page);
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    this.sortBy = event.field;
    this.sortDir = event.dir;
    this.loadProducts(1);
  }

  onFilter(filters: Record<string, string>): void {
    this.filters = filters;
    this.loadProducts(1);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteProduct(): void {
    const ids = this.selectedIds();
    if (ids.length > 0) {
      this.entityService.deleteBulk('products', ids).subscribe(() => {
        this.tableRef()?.resetPage(); this.loadProducts(); this.selectedIds.set([]); this.showDeleteDialog.set(false);
      });
    }
  }

  confirmDelete(): void {
    if (this.deleteId) {
      this.entityService.delete('products', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.tableRef()?.resetPage();
        this.loadProducts();
        this.selectedIds.set([]);
        this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteProduct();
    }
  }
}
