import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="flex items-center gap-2 rounded-md bg-[#f5f8fa] p-1">
      <span class="px-2 text-xs font-semibold uppercase tracking-wider text-[#7e8299]">{{ 'Period' | translate }}</span>
      @for (p of periods; track p.value) {
        <button
          type="button"
          (click)="selectPeriod(p.value)"
          [class]="selectedPeriod() === p.value
            ? 'rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-salmon shadow-sm'
            : 'rounded-md px-3 py-1.5 text-xs font-semibold text-[#7e8299] hover:bg-white hover:text-salmon'">
          {{ p.label | translate }}
        </button>
      }
    </div>
  `,
})
export class PeriodSelectorComponent {
  @Output() periodChange = new EventEmitter<string>();

  selectedPeriod = signal('day');
  periods = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  selectPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.periodChange.emit(period);
  }
}
