import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowAvailableProjectsComponent } from './show-available-projects.component';

describe('ShowAvailableProjectsComponent', () => {
    let component: ShowAvailableProjectsComponent;
    let fixture: ComponentFixture<ShowAvailableProjectsComponent>;

    beforeEach(waitForAsync(() => {
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
