import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyLeadComponent } from './monthly-lead.component';

describe('MonthlyLeadComponent', () => {
  let component: MonthlyLeadComponent;
  let fixture: ComponentFixture<MonthlyLeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyLeadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
