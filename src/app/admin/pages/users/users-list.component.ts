import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <h2 class="text-3xl font-bold uppercase text-blue-black">Users</h2>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [data]="users" [totalCount]="totalCount" [selectable]="true" (sortChange)="onSort($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/users', $event.id])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Users" [message]="'Delete ' + selectedIds().length + ' selected users?'" (confirm)="deleteSelected()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class UsersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  users = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone' },
    { field: 'isAdmin', header: 'Admin', format: (v) => v ? 'Yes' : 'No' },
    { field: 'role', header: 'Role', format: (v) => v?.name || '-' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];

  ngOnInit(): void {
    this.entityService.list<any>('users').subscribe((data) => {
      this.users.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.users()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.users.set(sorted);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action === 'delete' && this.selectedIds().length > 0) this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    this.entityService.deleteBulk('users', ids).subscribe(() => {
      this.entityService.list<any>('users').subscribe((data) => {
        this.users.set(data); this.totalCount.set(data.length);
      });
      this.selectedIds.set([]);
      this.showDeleteDialog.set(false);
    });
  }
}
