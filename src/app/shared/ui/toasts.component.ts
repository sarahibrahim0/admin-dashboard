import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ToastService } from './toast.service';

/** Global toast stack. Mount once (admin shell) — fires via ToastService. */
@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="pointer-events-none fixed bottom-4 end-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg"
          [class.border-emerald-200]="t.kind === 'success'"
          [class.bg-emerald-50]="t.kind === 'success'"
          [class.text-emerald-800]="t.kind === 'success'"
          [class.border-red-200]="t.kind === 'error'"
          [class.bg-red-50]="t.kind === 'error'"
          [class.text-[#ff4545]]="t.kind === 'error'"
          [class.border-[#e3e8ef]]="t.kind === 'info'"
          [class.bg-[#f5f8fa]]="t.kind === 'info'"
          [class.text-[#646D77]]="t.kind === 'info'">
          <i class="bi" [class.bi-check-circle]="t.kind === 'success'" [class.bi-exclamation-circle]="t.kind === 'error'" [class.bi-info-circle]="t.kind === 'info'"></i>
          <span class="flex-1">{{ t.key | translate }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" class="opacity-60 hover:opacity-100">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  protected toast = inject(ToastService);
}
