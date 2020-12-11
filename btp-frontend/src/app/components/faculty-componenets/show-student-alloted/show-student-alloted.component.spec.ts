import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowStudentAllotedComponent } from './show-student-alloted.component';

describe('ShowStudentAllotedComponent', () => {
    let component: ShowStudentAllotedComponent;
    let fixture: ComponentFixture<ShowStudentAllotedComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ShowStudentAllotedComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShowStudentAllotedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
