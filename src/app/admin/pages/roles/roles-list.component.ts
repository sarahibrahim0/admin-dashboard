import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RouterLink, BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold uppercase text-blue-black">Roles</h2>
        <a routerLink="new" class="rounded-md bg-salmon px-4 py-2 text-sm uppercase tracking-wider font-medium text-white hover:bg-[#e9855a]">Add Role</a>
      </div>
      <app-base-table [columns]="columns" [data]="roles" [totalCount]="totalCount" (sortChange)="onSort($event)" (rowClick)="router.navigate(['/admin/roles', $event.id, 'edit'])" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" title="Delete Role" message="Are you sure?" (confirm)="deleteRole()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class RolesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  roles = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'permissions', header: 'Permissions', format: (v) => v?.length || 0 },
    { field: 'isDefault', header: 'Default', format: (v) => v ? 'Yes' : 'No' },
  ];

  ngOnInit(): void {
    this.entityService.list<any>('roles').subscribe((data) => {
      this.roles.set(data); this.totalCount.set(data.length);
    });
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    const sorted = [...this.roles()].sort((a, b) => {
      const cmp = a[event.field] < b[event.field] ? -1 : a[event.field] > b[event.field] ? 1 : 0;
      return event.dir === 'asc' ? cmp : -cmp;
    });
    this.roles.set(sorted);
  }

  deleteRole(): void {
    if (this.deleteId) {
      this.entityService.delete('roles', this.deleteId).subscribe(() => {
        this.entityService.list<any>('roles').subscribe((data) => {
          this.roles.set(data); this.totalCount.set(data.length);
        });
        this.showDeleteDialog.set(false); this.deleteId = null;
      });
    }
  }
}
