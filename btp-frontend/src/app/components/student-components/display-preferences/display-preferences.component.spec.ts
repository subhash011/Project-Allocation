import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPreferencesComponent } from './display-preferences.component';

describe('DisplayPreferencesComponent', () => {
    let component: DisplayPreferencesComponent;
    let fixture: ComponentFixture<DisplayPreferencesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DisplayPreferencesComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DisplayPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
