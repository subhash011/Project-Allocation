// services
import { HttpErrorInterceptor } from "src/app/services/helpers/http-interceptor.service";
// faculty
import { FacultyComponent } from "src/app/components/faculty-components/faculty/faculty.component";
import { ContentComponent, FacultyPublish } from "src/app/components/faculty-components/content/content.component";
import { SidenavComponent } from "src/app/components/faculty-components/sidenav/sidenav.component";
import {
    GetDisplayedColumns,
    PreferencePipe,
    StudentTableComponent
} from "src/app/components/faculty-components/student-table/student-table.component";
import { SubmitPopUpComponent } from "src/app/components/faculty-components/submit-pop-up/submit-pop-up.component";
import { DeletePopUpComponent } from "src/app/components/faculty-components/delete-pop-up/delete-pop-up.component";
import { RefreshComponent } from "src/app/components/faculty-components/refresh/refresh.component";
import {
    ActiveProjects,
    AdminComponent,
    AllotedStudents,
    GetExportDisabled,
    GetIncludedOfTotal,
    GetViolations,
    ProceedPipe,
    SelectedLength,
    StudentIntake,
    TotalIntake
} from "src/app/components/faculty-components/admin/admin.component";
import { ResetComponent } from "src/app/components/faculty-components/reset/reset.component";
import { ShowStudentPreferencesComponent } from "src/app/components/faculty-components/show-student-preferences/show-student-preferences.component";
import { ShowFacultyPreferencesComponent } from "src/app/components/faculty-components/show-faculty-preferences/show-faculty-preferences.component";
import { ShowStudentAllotedComponent } from "src/app/components/faculty-components/show-student-alloted/show-student-alloted.component";
import { FacultyHomeComponent } from "src/app/components/faculty-components/faculty-home/faculty-home.component";
// shared
import { ThemePickerComponent } from "src/app/components/shared/theme-picker/theme-picker.component";
import { CheckLogIn, LoginComponent } from "src/app/components/shared/login/login.component";
import { CheckRegister, GetLinksForNavBar, NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { RegisterComponent } from "src/app/components/shared/register/register.component";
import { ProfileComponent, UserPhoto } from "src/app/components/shared/profile/profile.component";
import { CountDown, TimelineComponent } from "src/app/components/shared/timeline/timeline.component";
import { HelpComponent } from "src/app/components/shared/help/help.component";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { AdminCheck, FacultyCheck, StudentCheck, SuperAdminCheck } from "src/app/components/shared/Pipes/rolePipes";
// student
import { StudentComponent } from "src/app/components/student-components/student/student.component";
import { StudentProjectsComponent } from "src/app/components/student-components/student-projects/student-projects.component";
import {
    IsPreferenceEdit,
    ShowAvailableProjectsComponent
} from "src/app/components/student-components/show-available-projects/show-available-projects.component";
import { EditPreferencesComponent } from "src/app/components/student-components/edit-preferences/edit-preferences.component";
import { DisplayPreferencesComponent } from "src/app/components/student-components/display-preferences/display-preferences.component";
import { CdkDropListActualContainer } from "src/app/components/student-components/edit-preferences/edit-preferences.directive";
// super admin
import { FacultyTooltipSuper, GetRegisteredCount, SuperAdminComponent } from "src/app/components/super-admin/main/super-admin.component";
import { AddMapComponent } from "src/app/components/super-admin/add-map/add-map.component";
import { EditFormComponent } from "src/app/components/super-admin/edit-form/edit-form.component";
// others
import { AppRoutingModule } from "src/app/app-routing.module";
import { AppComponent } from "src/app/app.component";
import { MaterialModule } from "src/app/material/material.module";
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from "angularx-social-login";
import { environment } from "src/environments/environment";
import { HomeComponent } from "src/app/components/home/home.component";
import { SatPopoverModule } from "@ncstate/sat-popover";
// angular
import { BrowserModule } from "@angular/platform-browser";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";

const googleLoginOption = {
    prompt: "select_account"
};

@NgModule({
    declarations: [
        // faculty
        FacultyComponent,
        ContentComponent,
        FacultyPublish,
        SidenavComponent,
        GetDisplayedColumns,
        PreferencePipe,
        StudentTableComponent,
        SubmitPopUpComponent,
        DeletePopUpComponent,
        RefreshComponent,
        ActiveProjects,
        AdminComponent,
        AllotedStudents,
        GetExportDisabled,
        GetIncludedOfTotal,
        GetViolations,
        ProceedPipe,
        SelectedLength,
        StudentIntake,
        TotalIntake,
        ResetComponent,
        ShowStudentPreferencesComponent,
        ShowFacultyPreferencesComponent,
        ShowStudentAllotedComponent,
        FacultyHomeComponent,
        //shared
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
        // super admin
        FacultyTooltipSuper,
        GetRegisteredCount,
        SuperAdminComponent,
        AddMapComponent,
        EditFormComponent,
        // student
        StudentComponent,
        StudentProjectsComponent,
        IsPreferenceEdit,
        ShowAvailableProjectsComponent,
        EditPreferencesComponent,
        DisplayPreferencesComponent,
        CdkDropListActualContainer,
        // others
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        DragDropModule,
        FormsModule,
        MatSortModule,
        MatTableModule,
        MatSortModule,
        SatPopoverModule,
        SocialLoginModule
    ],
    exports: [],
    providers: [
        {
            provide: "SocialAuthServiceConfig",
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(environment.GOOGLE_CLIENT_ID, googleLoginOption)
                    }
                ]
            } as SocialAuthServiceConfig
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {hasBackdrop: true}
        },
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: {duration: 3000, panelClass: "default-class"}
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorInterceptor,
            multi: true
        }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
