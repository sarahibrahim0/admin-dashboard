import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { readTableQuery } from '../../../shared/table/table-query';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-8">
      <app-page-header title="{{ 'Roles' | translate }}" eyebrow="{{ 'Access' | translate }}" subtitle="{{ 'Manage access roles and permissions.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add Role' | translate }}</a>
      </app-page-header>

      <app-base-table [columns]="columns" [actions]="actions" [data]="roles" [totalCount]="totalCount" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (rowClick)="router.navigate(['/admin/roles', $event.id])" (actionClick)="handleAction($event)" />
    </div>

    <app-confirm-dialog
      [open]="showDeleteDialog()"
      [title]="'Delete Role' | translate"
      [message]="'Are you sure you want to delete this role? This action cannot be undone.' | translate"
      (confirm)="deleteRole()"
      (cancel)="showDeleteDialog.set(false)"
    />
  `,
})
export class RolesListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  protected router = inject(Router);
  private language = inject(LanguageService);
  private route = inject(ActivatedRoute);
  roles = signal<any[]>([]);
  totalCount = signal(0);
  showDeleteDialog = signal(false);
  deleteId: string | null = null;

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text', placeholder: 'name', format: (v) => this.language.localizedValue(v) || '-' },
    { field: 'permissions', header: 'Permissions', format: (_v, row) => ({ chips: this.getPermissionGroups(row.permissions) }) },
    { field: 'isDefault', header: 'Default', filterable: true, filterType: 'boolean', format: (v) => ({ icon: v ? 'bi-check-circle-fill' : 'bi-dash', iconClass: v ? 'text-green-500' : 'text-[#c9c9c9]' }) },
    { field: 'addedOn', header: 'Added on', format: (_v, row) => formatAddedOn(row, ['createdAt'], this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'createdBy', header: 'Added by', format: (v) => this.language.localizedValue(v?.name) || '-' },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];

  private permissionGroupMap: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    users: 'Users',
    coupons: 'Coupons',
    reviews: 'Reviews',
    roles: 'Roles',
  };

  ngOnInit(): void {
    this.loadRoles();
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || 'createdAt';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;
  pageSize = signal(20);

  loadRoles(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page, limit: 20, sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.search, filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('roles', params),
      (res) => { this.roles.set(res.data); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadRoles(1); }
  onPageChange(page: number): void { this.currentPage = page; this.loadRoles(page); }
  onSort(event: { field: string; dir: 'asc' | 'desc' }): void { this.sortBy = event.field; this.sortDir = event.dir; this.loadRoles(1); }
  onFilter(filters: Record<string, string>): void { this.filters = filters; this.loadRoles(1); }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/roles', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/roles', event.row.id, 'edit']);
    } else if (event.action === 'delete') {
      this.confirmDelete(event.row.id);
    }
  }

  getPermissionGroups(permissions: string[]): string[] {
    if (!permissions) return [];
    const groups = new Set<string>();
    for (const perm of permissions) {
      const prefix = perm.split(':')[0];
      const label = this.permissionGroupMap[prefix] || prefix;
      groups.add(label);
    }
    return Array.from(groups);
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.showDeleteDialog.set(true);
  }

  deleteRole(): void {
    if (this.deleteId) {
      this.entityService.delete('roles', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.loadRoles();
        this.showDeleteDialog.set(false);
      });
    }
  }
}