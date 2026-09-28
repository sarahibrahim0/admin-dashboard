import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';

Chart.register(...registerables);

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#F97316', '#64748B'];

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="rounded-lg border border-border bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold uppercase text-blue-black">{{ 'Products by Category' | translate }}</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class CategoryChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { category: { id: string; name: string | { en: string; ar: string } }; count: number }[] = [];
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
        labels: this.data.map((d) => this.language.localizedValue(d.category.name)),
        datasets: [{
          data: this.data.map((d) => d.count),
          backgroundColor: COLORS.slice(0, this.data.length),
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