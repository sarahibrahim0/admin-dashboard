import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-900">Audit Logs</h1>

      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-4 flex gap-4">
          <select [(ngModel)]="selectedEntity" (ngModelChange)="loadLogs()"
            class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">All Entities</option>
            @for (entity of entities(); track entity) {
              <option [value]="entity">{{ entity }}</option>
            }
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-4 py-3 font-medium text-slate-600">Action</th>
                <th class="px-4 py-3 font-medium text-slate-600">Entity</th>
                <th class="px-4 py-3 font-medium text-slate-600">User</th>
                <th class="px-4 py-3 font-medium text-slate-600">Changes</th>
                <th class="px-4 py-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (log of logs(); track log._id) {
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                  <td class="px-4 py-3">
                    <span class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                      [class]="getSeverity(log.action)">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-700">{{ log.entity }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ log.user?.name || log.user?.email || '-' }}</td>
                  <td class="max-w-xs truncate px-4 py-3 text-slate-500">{{ log.changes | json }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ log.createdAt | date:'medium' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-slate-500">No audit logs found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="currentPage() <= 1"
              class="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40">
              Previous
            </button>
            <button (click)="nextPage()" [disabled]="currentPage() >= totalPages()"
              class="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40">
              Next
            </button>
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

  getSeverity(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-50 text-emerald-700';
      case 'update': return 'bg-amber-50 text-amber-700';
      case 'delete': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
