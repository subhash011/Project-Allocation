import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFacultyPreferencesComponent } from './show-faculty-preferences.component';

describe('ShowFacultyPreferencesComponent', () => {
  let component: ShowFacultyPreferencesComponent;
  let fixture: ComponentFixture<ShowFacultyPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowFacultyPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowFacultyPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
