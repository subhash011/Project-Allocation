import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeletePopUpComponent } from './delete-pop-up.component';

describe('DeletePopUpComponent', () => {
    let component: DeletePopUpComponent;
    let fixture: ComponentFixture<DeletePopUpComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [DeletePopUpComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeletePopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
