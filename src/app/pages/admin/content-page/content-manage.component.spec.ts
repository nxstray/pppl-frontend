import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentManageComponent } from './content-manage.component';

describe('ContentManageComponent', () => {
  let component: ContentManageComponent;
  let fixture: ComponentFixture<ContentManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
