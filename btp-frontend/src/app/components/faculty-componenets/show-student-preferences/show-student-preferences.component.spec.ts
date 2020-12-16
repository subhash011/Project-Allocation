import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ShowStudentPreferencesComponent } from "./show-student-preferences.component";

describe("ShowStudentPreferencesComponent", () => {
    let component: ShowStudentPreferencesComponent;
    let fixture: ComponentFixture<ShowStudentPreferencesComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ShowStudentPreferencesComponent],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ShowStudentPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
