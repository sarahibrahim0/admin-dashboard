import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">{{ label }}</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ value }}</p>
          @if (subtitle) {
            <p class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
          }
        </div>
        <div class="rounded-lg p-3" [ngClass]="iconBg">
          <i [class]="icon + ' text-lg ' + iconColor"></i>
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = 'pi pi-chart-bar';
  @Input() iconBg = 'bg-indigo-100';
  @Input() iconColor = 'text-indigo-600';
}
