import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAvailableProjectsComponent } from './show-available-projects.component';

describe('ShowAvailableProjectsComponent', () => {
    let component: ShowAvailableProjectsComponent;
    let fixture: ComponentFixture<ShowAvailableProjectsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ShowAvailableProjectsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShowAvailableProjectsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
