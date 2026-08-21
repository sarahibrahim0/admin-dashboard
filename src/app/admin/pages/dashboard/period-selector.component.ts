import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="text-sm text-[#646D77]">Period:</span>
      @for (p of periods; track p.value) {
        <button
          (click)="selectPeriod(p.value)"
          [class]="selectedPeriod() === p.value
            ? 'rounded-lg bg-salmon px-3 py-1 text-sm text-white'
            : 'rounded-lg bg-[#ecd7cd] px-3 py-1 text-sm text-[#646D77] hover:bg-[#ecd7cd]'">
          {{ p.label }}
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
