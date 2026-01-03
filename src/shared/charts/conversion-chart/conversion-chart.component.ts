import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';

import { ConversionData } from '../../../app/service/dashboard.service';
import { ChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-conversion-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './conversion-chart.component.html',
  styleUrls: ['./conversion-chart.component.scss']
})
export class ConversionChartComponent {

  chartConfig?: ChartConfiguration;

  @Input() set data(value: ConversionData[]) {
    if (!value?.length) return;
    this.chartConfig = this.buildConfig(value);
  }

  private buildConfig(data: ConversionData[]): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Conversion Rate (%)',
          data: data.map(d => d.conversionRate),
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    };
  }
}
