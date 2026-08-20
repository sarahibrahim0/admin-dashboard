import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-user-growth-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-slate-200 bg-white p-6">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">User Growth</h3>
      <div class="h-64">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class UserGrowthChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: { date: string; count: number }[] = [];

  private chart: Chart | null = null;

  ngAfterViewInit(): void { this.renderChart(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['data'] && this.chartCanvas) this.renderChart(); }
  ngOnDestroy(): void { this.chart?.destroy(); }

  private renderChart(): void {
    if (!this.chartCanvas || !this.data.length) return;
    this.chart?.destroy();

    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.data.map((d) => d.date),
        datasets: [{
          label: 'New Users',
          data: this.data.map((d) => d.count),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
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
