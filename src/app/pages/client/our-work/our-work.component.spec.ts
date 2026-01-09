import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurWorkComponent } from './our-work.component';

describe('OurWorkComponent', () => {
  let component: OurWorkComponent;
  let fixture: ComponentFixture<OurWorkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurWorkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurWorkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
