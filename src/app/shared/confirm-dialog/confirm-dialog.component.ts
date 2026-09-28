import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 class="text-lg font-semibold uppercase text-blue-black">{{ title | translate }}</h3>
          <p class="mt-2 text-sm text-[#646D77]">{{ message | translate }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="cancel.emit()" class="btn btn-secondary">{{ 'Cancel' | translate }}</button>
            <button (click)="confirm.emit()" [class]="confirmClass">{{ confirmLabel | translate }}</button>
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
  @Input() confirmClass = 'btn btn-danger';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
