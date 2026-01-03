import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionChartComponent } from './conversion-chart.component';

describe('ConversionChartComponent', () => {
  let component: ConversionChartComponent;
  let fixture: ComponentFixture<ConversionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
