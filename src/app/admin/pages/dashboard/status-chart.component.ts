import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Processed: '#10b981',
  Cancelled: '#ef4444',
  Shipped: '#3b82f6',
  Delivered: '#8b5cf6',
};

@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">Orders by Status</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class StatusChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { status: string; count: number }[] = [];

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
        labels: this.data.map((d) => d.status),
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