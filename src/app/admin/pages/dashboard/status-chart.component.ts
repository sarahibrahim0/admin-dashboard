import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';

Chart.register(...registerables);

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Processed: '#10b981',
  Cancelled: '#ef4444',
  Shipped: '#6366F1',
  Delivered: '#8b5cf6',
};

@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="rounded-lg border border-border bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold uppercase text-blue-black">{{ 'Orders by Status' | translate }}</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class StatusChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { status: string; count: number }[] = [];
  private language = inject(LanguageService);

  private chart: Chart | null = null;

  constructor() {
    // Canvas content is not reactive — redraw with the new language on toggle.
    effect(() => {
      this.language.language();
      if (this.chartCanvas) this.renderChart();
    });
  }

  ngAfterViewInit(): void { this.renderChart(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['data'] && this.chartCanvas) this.renderChart(); }
  ngOnDestroy(): void { this.chart?.destroy(); }

  private renderChart(): void {
    if (!this.chartCanvas || !this.data.length) return;
    this.chart?.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.data.map((d) => this.language.translate(d.status)),
        datasets: [{
          data: this.data.map((d) => d.count),
          backgroundColor: this.data.map((d) => STATUS_COLORS[d.status] || '#6b7280'),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, padding: 12 } },
        },
      },
    });
  }
}