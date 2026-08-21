import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold uppercase text-blue-black">Content</h2>
        <a routerLink="new" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider font-medium text-white hover:bg-[#e9855a]">Add Page</a>
      </div>
      <app-base-table [columns]="columns" [data]="pages" [totalCount]="totalCount" (sortChange)="onSort($event)" (rowClick)="router.navigate(['/admin/content', $event.id, 'edit'])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Content" message="Are you sure?" (confirm)="deletePage()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class ContentListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  pages = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'key', header: 'Key', sortable: true },
    { field: 'title', header: 'Title', sortable: true },
    { field: 'subtitle', header: 'Subtitle', format: (v) => v || '-' },
    { field: 'updatedAt', header: 'Updated', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  ngOnInit(): void {
    this.entityService.list<any>('content').subscribe((data) => {
      this.pages.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.pages()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.pages.set(sorted);
  }

  deletePage(): void {
    if (this.deleteId) {
      this.entityService.delete('content', this.deleteId).subscribe(() => {
        this.entityService.list<any>('content').subscribe((data) => {
          this.pages.set(data); this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
