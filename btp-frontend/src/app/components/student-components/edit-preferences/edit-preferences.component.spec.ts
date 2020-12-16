import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { EditPreferencesComponent } from "./edit-preferences.component";

describe("EditPreferencesComponent", () => {
    let component: EditPreferencesComponent;
    let fixture: ComponentFixture<EditPreferencesComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ EditPreferencesComponent ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(EditPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
