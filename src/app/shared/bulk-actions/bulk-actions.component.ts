import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../i18n/translate.pipe';

export interface BulkAction {
  label: string;
  icon: string;
  action: string;
  confirmMessage?: string;
}

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (selectedCount > 0) {
      <div class="flex items-center gap-2 rounded-lg border border-[#ecd7cd] bg-[#F6F8FE] px-4 py-2">
        <span class="text-sm font-medium text-salmon">{{ selectedCount }} {{ 'selected' | translate }}</span>
        @for (action of actions; track action.action) {
          <button (click)="actionClick.emit(action)" class="btn btn-secondary btn-sm">{{ action.label | translate }}</button>
        }
        <button (click)="clearSelection.emit()" class="ms-auto text-xs text-salmon hover:text-[#e9855a]">{{ 'Clear' | translate }}</button>
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
