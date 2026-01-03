import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseChartComponent } from './base-chart.component';

describe('BaseChartComponent', () => {
  let component: BaseChartComponent;
  let fixture: ComponentFixture<BaseChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
