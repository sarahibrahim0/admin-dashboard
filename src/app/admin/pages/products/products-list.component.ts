import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Products</h2>
        <a routerLink="new" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add Product</a>
      </div>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [data]="products" [totalCount]="totalCount" [selectable]="true" (searchChange)="onSearch($event)" (sortChange)="onSort($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/products', $event.id])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Product" message="Are you sure?" (confirm)="deleteProduct()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ProductsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  products = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'price', header: 'Price', sortable: true, format: (v) => `$${v?.toFixed(2)}` },
    { field: 'category', header: 'Category', format: (v) => typeof v === 'object' ? v?.name : v || '-' },
    { field: 'countInStock', header: 'Stock', sortable: true },
    { field: 'rating', header: 'Rating', format: (v) => `${v?.toFixed(1)} ★` },
    { field: 'isFeatured', header: 'Featured', format: (v) => v ? 'Yes' : 'No' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'pi pi-trash', action: 'delete' }];

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.entityService.list<any>('products').subscribe((data) => {
      this.products.set(data);
      this.totalCount.set(data.length);
    });
  }

  onSearch(query: string): void {
    if (query) {
      this.entityService.list<any>('products', { name: query }).subscribe((data) => {
        this.products.set(data);
        this.totalCount.set(data.length);
      });
    } else {
      this.loadProducts();
    }
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.products()].sort((a, b) => {
      const aVal = a[event.field]; const bVal = b[event.field];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.products.set(sorted);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete') this.showDeleteDialog.set(true);
  }

  deleteProduct(): void {
    if (this.deleteId) {
      this.entityService.delete('products', this.deleteId).subscribe(() => {
        this.loadProducts(); this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
