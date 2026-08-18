import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="cancel.emit()" class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
            <button (click)="confirm.emit()" class="rounded-md bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
