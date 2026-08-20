import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">Products by Category</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class CategoryChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { category: { id: string; name: string }; count: number }[] = [];

  private chart: Chart | null = null;

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
        labels: this.data.map((d) => d.category.name),
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