import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';

import { TrendData } from '../../../app/service/admin/dashboard.service';
import { ChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-lead-trend-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './lead-trend.component.html',
  styleUrls: ['./lead-trend.component.scss']
})
export class LeadTrendChartComponent {

  chartConfig?: ChartConfiguration;

  @Input() set data(value: TrendData[]) {
    if (!value?.length) return;
    this.chartConfig = this.buildConfig(value);
  }

  private buildConfig(data: TrendData[]): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Leads Growth',
          data: data.map(d => d.count),
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    };
  }
}
