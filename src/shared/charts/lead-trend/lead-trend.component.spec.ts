import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadTrendComponent } from './lead-trend.component';

describe('LeadTrendComponent', () => {
  let component: LeadTrendComponent;
  let fixture: ComponentFixture<LeadTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
