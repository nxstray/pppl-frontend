import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestLayananComponent } from './request-layanan.component';

describe('RequestLayananComponent', () => {
  let component: RequestLayananComponent;
  let fixture: ComponentFixture<RequestLayananComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestLayananComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestLayananComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
