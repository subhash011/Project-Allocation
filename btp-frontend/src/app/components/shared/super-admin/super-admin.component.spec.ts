import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SuperAdminComponent } from './super-admin.component';

describe('SuperAdminComponent', () => {
    let component: SuperAdminComponent;
    let fixture: ComponentFixture<SuperAdminComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SuperAdminComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SuperAdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
