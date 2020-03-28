import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTableComponent } from './student-table.component';

describe('StudentTableComponent', () => {
  let component: StudentTableComponent;
  let fixture: ComponentFixture<StudentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
