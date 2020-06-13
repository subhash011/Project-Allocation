import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyHomeComponent } from './faculty-home.component';

describe('FacultyHomeComponent', () => {
  let component: FacultyHomeComponent;
  let fixture: ComponentFixture<FacultyHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacultyHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacultyHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
