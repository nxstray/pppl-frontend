import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManageComponent } from './project-manage.component';

describe('ProjectManageComponent', () => {
  let component: ProjectManageComponent;
  let fixture: ComponentFixture<ProjectManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
