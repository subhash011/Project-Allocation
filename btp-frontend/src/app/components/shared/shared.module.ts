import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ThemePickerComponent } from "src/app/components/shared/theme-picker/theme-picker.component";
import { CheckLogIn, LoginComponent } from "src/app/components/shared/login/login.component";
import { CheckRegister, GetLinksForNavBar, NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { RegisterComponent } from "src/app/components/shared/register/register.component";
import { ProfileComponent, UserPhoto } from "src/app/components/shared/profile/profile.component";
import { CountDown, TimelineComponent } from "src/app/components/shared/timeline/timeline.component";
import { HelpComponent } from "src/app/components/shared/help/help.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { AdminCheck, FacultyCheck, StudentCheck, SuperAdminCheck } from "src/app/components/shared/Pipes/rolePipes";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { MaterialModule } from "src/app/material/material.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { SatPopoverModule } from "@ncstate/sat-popover";
import { RouterModule } from "@angular/router";
import { GetRegisteredCount } from "src/app/components/shared/Pipes/otherPipes";

@NgModule({
    declarations: [
        ThemePickerComponent,
        CheckLogIn,
        LoginComponent,
        CheckRegister,
        GetLinksForNavBar,
        NavbarComponent,
        RegisterComponent,
        ProfileComponent,
        UserPhoto,
        CountDown,
        TimelineComponent,
        HelpComponent,
        LoaderComponent,
        AdminCheck,
        FacultyCheck,
        StudentCheck,
        SuperAdminCheck,
        GetRegisteredCount
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        DragDropModule,
        FormsModule,
        MatSortModule,
        MatTableModule,
        MatSortModule,
        SatPopoverModule
    ],
    exports: [
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        DragDropModule,
        FormsModule,
        MatSortModule,
        MatTableModule,
        MatSortModule,
        SatPopoverModule,
        CommonModule,
        ThemePickerComponent,
        CheckLogIn,
        LoginComponent,
        CheckRegister,
        GetLinksForNavBar,
        NavbarComponent,
        RegisterComponent,
        ProfileComponent,
        UserPhoto,
        CountDown,
        TimelineComponent,
        HelpComponent,
        LoaderComponent,
        AdminCheck,
        FacultyCheck,
        StudentCheck,
        SuperAdminCheck,
        GetRegisteredCount
    ]
})
export class SharedModule {}
