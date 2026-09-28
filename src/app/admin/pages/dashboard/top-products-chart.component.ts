import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';

Chart.register(...registerables);

@Component({
  selector: 'app-top-products-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="rounded-lg border border-border bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold uppercase text-blue-black">{{ 'Top Products' | translate }}</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class TopProductsChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { name: string | { en: string; ar: string }; totalSold: number; revenue: number }[] = [];
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
      type: 'bar',
      data: {
        labels: this.data.map((d) => this.language.localizedValue(d.name)),
        datasets: [{
          label: this.language.translate('Units Sold'),
          data: this.data.map((d) => d.totalSold),
          backgroundColor: '#4F46E5',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }
}
