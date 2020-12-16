import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RefreshComponent } from "./refresh.component";

describe("RefreshComponent", () => {
    let component: RefreshComponent;
    let fixture: ComponentFixture<RefreshComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [RefreshComponent],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(RefreshComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
