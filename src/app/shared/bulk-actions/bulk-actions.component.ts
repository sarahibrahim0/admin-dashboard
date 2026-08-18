import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BulkAction {
  label: string;
  icon: string;
  action: string;
  confirmMessage?: string;
}

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (selectedCount > 0) {
      <div class="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2">
        <span class="text-sm font-medium text-indigo-700">{{ selectedCount }} selected</span>
        @for (action of actions; track action.action) {
          <button
            (click)="actionClick.emit(action)"
            class="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50">
            {{ action.label }}
          </button>
        }
        <button
          (click)="clearSelection.emit()"
          class="ml-auto text-xs text-indigo-600 hover:text-indigo-800">
          Clear
        </button>
      </div>
    }
  `,
})
export class BulkActionsComponent {
  @Input() selectedCount = 0;
  @Input() actions: BulkAction[] = [];
  @Output() actionClick = new EventEmitter<BulkAction>();
  @Output() clearSelection = new EventEmitter<void>();
}
