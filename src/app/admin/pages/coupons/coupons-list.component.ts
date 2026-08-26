import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold uppercase text-blue-black">Coupons</h2>
        <a routerLink="new" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider font-medium text-white hover:bg-[#e9855a]">Add Coupon</a>
      </div>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [data]="coupons" [totalCount]="totalCount" [selectable]="true" (sortChange)="onSort($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/coupons', $event.id, 'edit'])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Coupons" [message]="'Delete ' + selectedIds().length + ' selected coupons?'" (confirm)="deleteSelected()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class CouponsListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  coupons = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'code', header: 'Code', sortable: true },
    { field: 'type', header: 'Type', format: (v) => v === 'percent' ? 'Percent' : 'Fixed' },
    { field: 'value', header: 'Value', format: (v, r) => r.type === 'percent' ? `${v}%` : `$${v}` },
    { field: 'usedCount', header: 'Used' },
    { field: 'maxUses', header: 'Max Uses', format: (v) => v === 0 ? 'Unlimited' : v },
    { field: 'active', header: 'Active', format: (v) => v ? 'Yes' : 'No' },
    { field: 'validUntil', header: 'Expires', format: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];

  ngOnInit(): void {
    this.entityService.list<any>('coupons').subscribe((data) => {
      this.coupons.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.coupons()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.coupons.set(sorted);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('coupons', ids).subscribe(() => {
      this.entityService.list<any>('coupons').subscribe((data) => {
        this.coupons.set(data); this.totalCount.set(data.length);
      });
      this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }
}
