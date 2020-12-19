import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ShowFacultyPreferencesComponent } from "src/app/components/admin/show-faculty-preferences/show-faculty-preferences.component";

describe("ShowFacultyPreferencesComponent", () => {
    let component: ShowFacultyPreferencesComponent;
    let fixture: ComponentFixture<ShowFacultyPreferencesComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ ShowFacultyPreferencesComponent ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ShowFacultyPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
