import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BellComponent } from './bell.component';

describe('BellComponent', () => {
  let component: BellComponent;
  let fixture: ComponentFixture<BellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
