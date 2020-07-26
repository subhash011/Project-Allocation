import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPreviewComponent } from './email-preview.component';

describe('EmailPreviewComponent', () => {
  let component: EmailPreviewComponent;
  let fixture: ComponentFixture<EmailPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
