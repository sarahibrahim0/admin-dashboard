import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { LanguageService } from '../../../core/services/language.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { ToastService } from '../../../shared/ui/toast.service';
import { EntityService } from '../../../core/services/entity.service';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { TableColumn, TableAction } from '../../../shared/table/table-column';
import { BulkActionsComponent, BulkAction } from '../../../shared/bulk-actions/bulk-actions.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';
import { readTableQuery } from '../../../shared/table/table-query';
import { formatAddedOn, formatDateTime } from '../../../shared/utils/datetime';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, BaseTableComponent, BulkActionsComponent, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Users' | translate }}" eyebrow="{{ 'Team' | translate }}" subtitle="{{ 'Manage team members and permissions.' | translate }}">
        <a actions routerLink="new" class="btn btn-primary"><i class="bi bi-plus-lg"></i>{{ 'Add User' | translate }}</a>
      </app-page-header>
      <app-bulk-actions [selectedCount]="selectedIds().length" [actions]="bulkActions" (actionClick)="handleBulkAction($event)" (clearSelection)="table?.clearSelection()" />
      <app-base-table #table [columns]="columns" [actions]="actions" [data]="users" [totalCount]="totalCount" [selectable]="true" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSortField]="sortBy" [initialSortDir]="sortDir" [initialSearch]="search" [initialFilters]="filters" [initialPage]="currentPage" [syncQueryParams]="true" (sortChange)="onSort($event)" (filterChange)="onFilter($event)" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)" (selectionChange)="selectedIds.set($event)" (rowClick)="router.navigate(['/admin/users', $event.id])" (actionClick)="handleAction($event)" />
    </div>
    <app-confirm-dialog [open]="showDeleteDialog()" [title]="'Delete Users' | translate" [message]="deleteId ? ('Are you sure?' | translate) : (('Delete' | translate) + ' ' + selectedIds().length + ' ' + ('selected users?' | translate))" (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
  `,
})
export class UsersListComponent implements OnInit {
  private entityService = inject(EntityService);
  protected loader = new LatestLoader();
  protected router = inject(Router);
  private language = inject(LanguageService);
  private auth = inject(AuthStore);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(20);
  users = signal<any[]>([]);
  totalCount = signal(0);
  selectedIds = signal<string[]>([]);
  showDeleteDialog = signal(false);

  columns: TableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text', placeholder: 'name', format: (v) => this.language.localizedValue(v) || '-' },
    { field: 'email', header: 'Email', sortable: true, filterable: true, filterType: 'text', placeholder: 'email' },
    { field: 'phone', header: 'Phone', filterable: true, filterType: 'text', placeholder: 'phone' },
    { field: 'isAdmin', header: 'Admin', filterable: true, filterType: 'boolean', format: (v) => v ? 'Yes' : 'No' },
    { field: 'role', header: 'Role', format: (v) => this.language.localizedValue(v?.name) || '-' },
    { field: 'addedOn', header: 'Added on', format: (_v, row) => formatAddedOn(row, [], this.language.language()) },
    { field: 'updatedAt', header: 'Updated', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
    { field: 'createdBy', header: 'Added by', format: (v) => this.language.localizedValue(v?.name) || '-' },
    { field: 'isActive', header: 'Status', sortable: true, filterable: true, filterType: 'boolean', format: (v) => ({ badge: v ? 'Active' : 'Inactive', badgeClass: v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }) },
  ];
  actions: TableAction[] = [
    { type: 'view', icon: 'bi bi-eye', title: 'View' },
    { type: 'edit', icon: 'bi bi-pencil', title: 'Edit', class: 'text-[#797979] hover:bg-[#f1faff] hover:text-[#1e6bb8]' },
    { type: 'delete', icon: 'bi bi-trash', title: 'Delete', class: 'text-[#797979] hover:bg-red-50 hover:text-[#ff4545]' },
  ];
  bulkActions: BulkAction[] = [{ label: 'Delete', icon: 'trash', action: 'delete' }];
  deleteId: string | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  handleAction(event: { action: string; row: any }): void {
    if (event.action === 'view') {
      this.router.navigate(['/admin/users', event.row.id]);
    } else if (event.action === 'edit') {
      this.router.navigate(['/admin/users', event.row.id, 'edit']);
    } else if (event.action === 'delete') {
      if (this.isSelf(event.row.id)) {
        this.toast.error('You cannot delete your own account');
        return;
      }
      this.deleteId = event.row.id;
      this.showDeleteDialog.set(true);
    }
  }

  private isSelf(id: string): boolean {
    const mine = this.auth.userId();
    return !!mine && mine === id;
  }

  loadUsers(page = this.currentPage): void {
    const params = this.entityService.buildQueryParams({
      page,
      limit: 20,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.search,
      filter: this.filters,
    });
    this.loader.load(
      this.entityService.listPaginated<any>('users', params),
      (res) => { this.users.set(res.data); this.totalCount.set(res.total); },
    );
  }

  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  currentPage = this.queryState.page;
  sortBy = this.queryState.sortField || '_id';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;
  search = this.queryState.search;
  filters: Record<string, string> = this.queryState.filters;

  onSearch(query: string): void {
    this.search = query;
    this.loadUsers(1);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers(page);
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    this.sortBy = event.field;
    this.sortDir = event.dir;
    this.loadUsers(1);
  }

  onFilter(filters: Record<string, string>): void {
    this.filters = filters;
    this.loadUsers(1);
  }

  handleBulkAction(action: BulkAction): void {
    if (action.action !== 'delete' || this.selectedIds().length === 0) return;
    if (this.selectedIds().some((id) => this.isSelf(id))) {
      this.toast.error('You cannot delete your own account');
      return;
    }
    this.showDeleteDialog.set(true);
  }

  deleteSelected(): void {
    const ids = this.selectedIds().filter((id) => !this.isSelf(id));
    if (ids.length === 0) return;
    this.entityService.deleteBulk('users', ids).subscribe(() => {
      this.tableRef()?.resetPage();
      this.loadUsers();
      this.selectedIds.set([]);
      this.showDeleteDialog.set(false);
    });
  }

  confirmDelete(): void {
    if (this.deleteId) {
      if (this.isSelf(this.deleteId)) {
        this.deleteId = null;
        this.showDeleteDialog.set(false);
        this.toast.error('You cannot delete your own account');
        return;
      }
      this.entityService.delete('users', this.deleteId).subscribe(() => {
        this.deleteId = null;
        this.tableRef()?.resetPage();
        this.loadUsers();
        this.selectedIds.set([]);
        this.showDeleteDialog.set(false);
      });
    } else {
      this.deleteSelected();
    }
  }
}
