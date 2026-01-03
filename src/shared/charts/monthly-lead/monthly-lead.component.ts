import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';

import { MonthData } from '../../../app/service/dashboard.service';
import { ChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-monthly-lead-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './monthly-lead.component.html',
  styleUrls: ['./monthly-lead.component.scss']
})
export class MonthlyLeadChartComponent {

  chartConfig?: ChartConfiguration;

  @Input() set data(value: MonthData[]) {
    if (!value?.length) return;
    this.chartConfig = this.buildConfig(value);
  }

  private buildConfig(data: MonthData[]): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          {
            label: 'Hot',
            data: data.map(d => d.hot),
            backgroundColor: 'rgba(250, 133, 133, 1)',
            borderColor: 'rgba(242, 59, 59, 1)',
            borderWidth: 1
          },
          {
            label: 'Warm',
            data: data.map(d => d.warm),
            backgroundColor: 'rgba(249, 178, 56, 0.85)',
            borderColor: 'rgba(251, 161, 6, 0.85)',
            borderWidth: 1
          },
          {
            label: 'Cold',
            data: data.map(d => d.cold),
            backgroundColor: 'rgba(158, 192, 248, 0.8)',
            borderColor: 'rgba(70, 137, 244, 0.8)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: false
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }
}