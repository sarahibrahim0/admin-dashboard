import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-orders-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">Orders Over Time</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class OrdersChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { date: string; revenue: number; orderCount: number }[] = [];

  private chart: Chart | null = null;

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
        labels: this.data.map((d) => d.date),
        datasets: [{
          label: 'Orders',
          data: this.data.map((d) => d.orderCount),
          backgroundColor: '#06b6d4',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }
}