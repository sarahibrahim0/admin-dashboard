import { Component, OnInit, inject, signal } from '@angular/core';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold uppercase text-blue-black">Reviews</h2>
      <app-base-table [columns]="columns" [data]="reviews" [totalCount]="totalCount" (sortChange)="onSort($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Review" message="Are you sure?" (confirm)="deleteReview()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ReviewsListComponent implements OnInit {
  private entityService = inject(EntityService);
  reviews = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'user', header: 'User', format: (v) => v?.name || v?.email || '-' },
    { field: 'product', header: 'Product', format: (v) => v?.name || '-' },
    { field: 'rating', header: 'Rating', format: (v) => `${v} ★` },
    { field: 'comment', header: 'Comment', format: (v) => v || '-' },
    { field: 'dateCreated', header: 'Date', format: (v) => new Date(v).toLocaleDateString() },
  ];

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

  deleteReview(): void {
    if (this.deleteId) {
      this.entityService.delete('reviews', this.deleteId).subscribe(() => {
        this.reviews.set(this.reviews().filter((r) => r.id !== this.deleteId));
        this.totalCount.set(this.reviews().length);
        this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
