import { Component, DestroyRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';
import { LanguageService } from '../../../core/services/language.service';
import { displayAuditChanges } from '../../../shared/utils/audit-display';
import { formatDateTime } from '../../../shared/utils/datetime';
import { BaseTableComponent } from '../../../shared/table/base-table.component';
import { readTableQuery } from '../../../shared/table/table-query';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { TableColumn } from '../../../shared/table/table-column';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LatestLoader } from '../../../shared/utils/latest-loader';

@Component({
  selector: 'app-my-activity',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, PageHeaderComponent, BaseTableComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'My Activity' | translate }}" eyebrow="{{ 'Account' | translate }}" subtitle="{{ 'Review the actions performed from your account.' | translate }}"></app-page-header>

      <section class="rounded-lg border border-[#eadbd4] bg-white p-4 sm:p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F6F8FE] pb-4">
          <div>
            <h2 class="text-lg font-semibold uppercase text-blue-black">{{ 'Activity history' | translate }}</h2>
            <p class="mt-1 text-sm text-[#797979]">{{ 'Filter and search your recent actions.' | translate }}</p>
          </div>
          <select [(ngModel)]="selectedEntity" (ngModelChange)="resetAndLoad()"
            class="rounded-md border border-[#c9c9c9] px-3 py-2 text-sm outline-none focus:border-salmon">
            <option value="">{{ 'All Activity' | translate }}</option>
            <option value="Order">{{ 'Orders' | translate }}</option>
            <option value="Review">{{ 'Reviews' | translate }}</option>
            <option value="User">{{ 'Profile Changes' | translate }}</option>
          </select>
        </div>
        <app-base-table
          #table
          [columns]="columns"
          [data]="logs"
          [totalCount]="totalCount"
          [pageSize]="pageSize"
          [initialSortField]="sortBy"
          [initialSortDir]="sortDir"
          [initialSearch]="searchTerm"
          [initialPage]="currentPage()"
          [syncQueryParams]="true"
          [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)"
          (searchChange)="onSearch($event)"
          (sortChange)="onSort($event)"
        />
      </section>
    </div>
  `,
})
export class MyActivityComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private queryState = readTableQuery(this.route.snapshot.queryParamMap);
  tableRef = viewChild<BaseTableComponent>('table');

  logs = signal<any[]>([]);
  totalCount = signal(0);
  currentPage = signal(this.queryState.page);
  pageSize = signal(10);
  selectedEntity = this.route.snapshot.queryParamMap.get('entity') || '';
  searchTerm = this.queryState.search;
  sortBy = this.queryState.sortField || 'createdAt';
  sortDir: 'asc' | 'desc' = this.queryState.sortDir;

  columns: TableColumn[] = [
    { field: 'entity', header: 'Entity', width: '150px' },
    { field: 'id', header: 'Action', width: '120px', format: (v, row) => row.action },
    { field: 'details', header: 'Details', format: (v, row) => this.describeChanges(row) },
    { field: 'createdAt', header: 'Date', width: '200px', sortable: true, format: (v) => formatDateTime(v, this.language.language()) },
  ];

  ngOnInit(): void {
    this.loadLogs();
    // Back/forward button: external entity change → reapply + reload.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const entity = params.get('entity') || '';
      if (entity !== this.selectedEntity) {
        this.selectedEntity = entity;
        this.tableRef()?.resetPage();
        this.currentPage.set(1);
        this.loadLogs();
      }
    });
  }

  resetAndLoad(): void {
    this.currentPage.set(1);
    this.tableRef()?.resetPage();
    this.syncEntityParam();
    this.loadLogs();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLogs();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage.set(1);
    this.loadLogs();
  }

  onSort(event: { field: string; dir: 'asc' | 'desc' }): void {
    this.sortBy = event.field || 'createdAt';
    this.sortDir = event.dir;
    this.currentPage.set(1);
    this.loadLogs();
  }

  private syncEntityParam(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entity: this.selectedEntity || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  loadLogs(): void {
    this.loader.load(
      this.auditLogService.getMyLogs(this.currentPage(), this.pageSize(), this.selectedEntity || undefined, undefined, this.sortBy, this.sortDir, this.searchTerm),
      (res) => { this.logs.set(res.logs.map((log) => ({ ...log, id: log._id, details: this.describeChanges(log) }))); this.totalCount.set(res.total); },
    );
  }

  describeChanges(log: AuditLog): string {
    return displayAuditChanges(log.changes, this.language.language());
  }
}