import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [FormsModule, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-bold uppercase text-blue-black">Orders</h2>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterByStatus()" class="rounded-md border border-[#c9c9c9] px-3 py-1.5 text-sm outline-none focus:border-salmon">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [data]="orders" [totalCount]="totalCount" [selectable]="true" (sortChange)="onSort($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/orders', $event.id])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Orders" [message]="'Delete ' + selectedIds().length + ' selected orders?'" (confirm)="deleteSelected()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class OrdersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  orders = signal<any[]>([]);
  totalCount = signal(0);
  statusFilter = '';
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'id', header: 'Order ID', width: '120px', format: (v) => v?.slice(-8) },
    { field: 'user', header: 'Customer', format: (v) => v?.name || v?.email || '-' },
    { field: 'totalPrice', header: 'Total', sortable: true, format: (v) => `$${v?.toFixed(2)}` },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'paymentStatus', header: 'Payment' },
    { field: 'dateOrdered', header: 'Date', sortable: true, format: (v) => new Date(v).toLocaleDateString() },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.entityService.list<any>('orders').subscribe((data) => {
      this.orders.set(data); this.totalCount.set(data.length);
    });
  }

  filterByStatus(): void { this.loadOrders(); }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.orders()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.orders.set(sorted);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('orders', ids).subscribe(() => {
      this.loadOrders(); this.selectedIds.set([]); this.showDeleteDialog.set(false);
    });
  }
}
