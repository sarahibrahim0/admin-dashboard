import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Audit Logs</h1>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-4 flex gap-4">
          <select [(ngModel)]="selectedEntity" (ngModelChange)="loadLogs()"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Entities</option>
            @for (entity of entities(); track entity) {
              <option [value]="entity">{{ entity }}</option>
            }
          </select>
        </div>

        <p-table [value]="logs()" [tableStyle]="{ 'min-width': '60rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>User</th>
              <th>Changes</th>
              <th>Date</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-log>
            <tr>
              <td>
                <p-tag [value]="log.action" [severity]="getSeverity(log.action)" />
              </td>
              <td>{{ log.entity }}</td>
              <td>{{ log.user?.name || log.user?.email || '-' }}</td>
              <td class="max-w-xs truncate">{{ log.changes | json }}</td>
              <td>{{ log.createdAt | date:'medium' }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="5" class="py-8 text-center text-slate-500">No audit logs found</td></tr>
          </ng-template>
        </p-table>

        <div class="mt-4 flex justify-between text-sm text-slate-600">
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <div class="flex gap-2">
            <p-button label="Previous" [disabled]="currentPage() <= 1" (onClick)="prevPage()" size="small" />
            <p-button label="Next" [disabled]="currentPage() >= totalPages()" (onClick)="nextPage()" size="small" />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditLogsListComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  logs = signal<AuditLog[]>([]);
  entities = signal<string[]>([]);
  selectedEntity = '';
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.auditLogService.getEntities().subscribe((e) => this.entities.set(e));
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService.getLogs(this.currentPage(), 50, this.selectedEntity || undefined).subscribe((res) => {
      this.logs.set(res.logs);
      this.totalPages.set(res.totalPages);
    });
  }

  nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.loadLogs();
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.loadLogs();
  }

  getSeverity(action: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (action.toLowerCase()) {
      case 'create': return 'success';
      case 'update': return 'warn';
      case 'delete': return 'danger';
      default: return 'info';
    }
  }
}
