import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AdminComponent } from "src/app/components/admin/main/admin.component";

describe("AdminComponent", () => {
    let component: AdminComponent;
    let fixture: ComponentFixture<AdminComponent>;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ AdminComponent ]
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(AdminComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
