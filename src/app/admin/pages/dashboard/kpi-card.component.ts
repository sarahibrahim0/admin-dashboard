import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="h-full rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted">{{ label | translate }}</p>
          <p class="mt-1 text-2xl font-bold uppercase text-blue-black">{{ value }}</p>
          @if (subtitle) {
            <p class="mt-1 text-xs text-faint">{{ subtitle | translate }}</p>
          }
        </div>
        <div class="rounded-md p-3" [ngClass]="iconBg">
          <svg class="h-5 w-5" [ngClass]="iconColor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path [attr.d]="getIconPath(icon)" />
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = 'chart-bar';
  @Input() iconBg = 'bg-surface';
  @Input() iconColor = 'text-blue-black';

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      'dollar': 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
      'shopping-cart': 'M3 3h2l2.6 12.3a2 2 0 002 1.7h7.7a2 2 0 002-1.6L21 7H6M9.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
      'box': 'M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
      'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
      'clock': 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2',
      'exclamation-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
      'chart-bar': 'M18 20V10M12 20V4M6 20v-6',
    };
    return icons[icon] || 'M12 2v20M2 12h20';
  }
}
