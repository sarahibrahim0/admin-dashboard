import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn } from '../../../shared/table/table-column';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [BaseTableComponent],
  template: `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold uppercase text-blue-black">Users</h2>
      <app-base-table [columns]="columns" [data]="users" [totalCount]="totalCount" (sortChange)="onSort($event)" (rowClick)="router.navigate(['/admin/users', $event.id])" />
    </div>
  `,
})
export class UsersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected router = inject(Router);
  users = signal<any[]>([]);
  totalCount = signal(0);

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone' },
    { field: 'isAdmin', header: 'Admin', format: (v) => v ? 'Yes' : 'No' },
    { field: 'role', header: 'Role', format: (v) => v?.name || '-' },
  ];

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
}
