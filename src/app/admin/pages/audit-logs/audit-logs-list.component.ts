import { Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../core/services/audit-log.service';
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
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [FormsModule, TranslatePipe, PageHeaderComponent, BaseTableComponent],
  template: `
    <div class="space-y-6">
      <app-page-header title="{{ 'Audit Logs' | translate }}" eyebrow="{{ 'Security' | translate }}" subtitle="{{ 'Review system activity and changes.' | translate }}"></app-page-header>

      <app-base-table #table [columns]="columns" [data]="logs" [totalCount]="totalCount" [serverSidePagination]="true" [pageSize]="pageSize" (searchChange)="onSearch($event)" [initialSearch]="queryState.search" [initialPage]="queryState.page" [syncQueryParams]="true" [loading]="loader.loading()" [error]="loader.error()" (pageChange)="onPageChange($event)">
        <div actions>
          <select [(ngModel)]="selectedEntity" (ngModelChange)="onFilterChange()"
            class="w-full rounded-md border border-[#c9c9c9] px-2 py-1.5 text-sm sm:w-48">
            <option value="">{{ 'All Entities' | translate }}</option>
            @for (entity of entities(); track entity) {
              <option [value]="entity">{{ entity }}</option>
            }
          </select>
        </div>
      </app-base-table>
    </div>
  `,
})
export class AuditLogsListComponent implements OnInit {
  private auditLogService = inject(AuditLogService);
  protected loader = new LatestLoader();
  private language = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  protected queryState = readTableQuery(this.route.snapshot.queryParamMap);
  protected search = this.queryState.search;

  tableRef = viewChild<BaseTableComponent>('table');
  pageSize = signal(50);
  logs = signal<any[]>([]);
  totalCount = signal(0);
  entities = signal<string[]>([]);
  selectedEntity = this.route.snapshot.queryParamMap.get('entity') || '';

  columns: TableColumn[] = [
    { field: 'action', header: 'Action', format: (v) => ({ badge: v, badgeClass: this.getSeverity(v) }) },
    { field: 'entity', header: 'Entity' },
    { field: 'user', header: 'User', format: (v) => this.language.localizedValue(v?.name) || v?.email || '-' },
    { field: 'changes', header: 'Changes', format: (v) => displayAuditChanges(v, this.language.language()) },
    { field: 'createdAt', header: 'Date', format: (v) => formatDateTime(v, this.language.language()) },
  ];

  ngOnInit(): void {
    this.auditLogService.getEntities().subscribe((e) => this.entities.set(e));
    this.loadLogs(this.queryState.page);
    // Back/forward button: external entity change → reapply + reload.
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const entity = params.get('entity') || '';
      if (entity !== this.selectedEntity) {
        this.selectedEntity = entity;
        this.tableRef()?.resetPage();
        this.loadLogs(1);
      }
    });
  }

  private syncEntityParam(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { entity: this.selectedEntity || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  loadLogs(page = 1): void {
    this.loader.load(
      this.auditLogService.getLogs(page, this.pageSize(), this.selectedEntity || undefined, undefined, this.search),
      (res) => { this.logs.set(res.logs.map((l) => ({ ...l, id: l._id }))); this.totalCount.set(res.total); },
    );
  }

  onSearch(query: string): void { this.search = query; this.loadLogs(1); }

  onFilterChange(): void {
    this.tableRef()?.resetPage();
    this.syncEntityParam();
    this.loadLogs(1);
  }

  onPageChange(page: number): void {
    this.loadLogs(page);
  }

  getSeverity(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-50 text-emerald-700';
      case 'update': return 'bg-amber-50 text-amber-700';
      case 'delete': return 'bg-[#fff5f5] text-[#ff4545]';
      default: return 'bg-[#ecd7cd] text-[#646D77]';
    }
  }
}