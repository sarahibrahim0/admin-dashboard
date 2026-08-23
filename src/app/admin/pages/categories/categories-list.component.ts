import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold uppercase text-blue-black">Categories</h2>
        <a routerLink="new" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider font-medium text-white hover:bg-[#e9855a]">Add Category</a>
      </div>
      <app-base-table [columns]="columns" [data]="categories" [totalCount]="totalCount" (sortChange)="onSort($event)" (rowClick)="router.navigate(['/admin/categories', $event.id, 'edit'])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Category" message="Are you sure?" (confirm)="deleteCategory()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CategoriesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  categories = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'icon', header: 'Icon' },
    { field: 'color', header: 'Color', format: (v) => v || '-' },
  ];

  ngOnInit(): void {
    this.entityService.list<any>('categories').subscribe((data) => {
      this.categories.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.categories()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.categories.set(sorted);
  }

  deleteCategory(): void {
    if (this.deleteId) {
      this.entityService.delete('categories', this.deleteId).subscribe(() => {
        this.entityService.list<any>('categories').subscribe((data) => {
          this.categories.set(data); this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
