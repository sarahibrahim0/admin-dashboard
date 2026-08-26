import { Component, OnInit, inject, signal } from '@angular/core';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <h2 class="text-3xl font-bold uppercase text-blue-black">Reviews</h2>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [data]="reviews" [totalCount]="totalCount" [selectable]="true" (sortChange)="onSort($event)" (selectionChange)="selectedIds.set($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Reviews" [message]="'Delete ' + selectedIds().length + ' selected reviews?'" (confirm)="deleteSelected()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ReviewsListComponent implements OnInit {
  private entityService = inject(EntityService);
  reviews = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'user', header: 'User', format: (v) => v?.name || v?.email || '-' },
    { field: 'product', header: 'Product', format: (v) => v?.name || '-' },
    { field: 'rating', header: 'Rating', format: (v) => `${v} ★` },
    { field: 'comment', header: 'Comment', format: (v) => v || '-' },
    { field: 'dateCreated', header: 'Date', format: (v) => new Date(v).toLocaleDateString() },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];

  ngOnInit(): void {
    this.entityService.list<any>('products').subscribe((products) => {
      const allReviews: any[] = [];
      products.forEach((p: any) => {
        if (p._id) {
          this.entityService.list<any>(`products/${p._id}/reviews`).subscribe((reviews) => {
            allReviews.push(...reviews.map((r: any) => ({ ...r, product: p })));
            this.reviews.set([...allReviews]);
            this.totalCount.set(allReviews.length);
          });
        }
      });
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.reviews()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.reviews.set(sorted);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('reviews', ids).subscribe(() => {
      this.reviews.set(this.reviews().filter((r) => !ids.includes(r._id)));
      this.totalCount.set(this.reviews().length);
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }
}
