import { ExporttocsvService } from 'src/app/services/exporttocsv/exporttocsv.service';
import { UserService } from 'src/app/services/user/user.service';
import { ThemePickerComponent } from 'src/app/components/shared/theme-picker/theme-picker.component';
import { MaterialModule } from 'src/app/material/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from 'angularx-social-login';
import { CheckLogIn, LoginComponent } from 'src/app/components/shared/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CheckRegister, GetLinksForNavBar, NavbarComponent, } from 'src/app/components/shared/navbar/navbar.component';
import { RegisterComponent } from 'src/app/components/shared/register/register.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StudentComponent } from 'src/app/components/student-components/student/student.component';
import { FacultyComponent } from 'src/app/components/faculty-componenets/faculty/faculty.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent, UserPhoto, } from 'src/app/components/shared/profile/profile.component';
import { StudentProjectsComponent } from 'src/app/components/student-components/student-projects/student-projects.component';
import { ContentComponent, FacultyPublish } from 'src/app/components/faculty-componenets/content/content.component';
import { SidenavComponent } from 'src/app/components/faculty-componenets/sidenav/sidenav.component';
import {
    GetDisplayedColumns,
    PreferencePipe,
    StudentTableComponent
} from 'src/app/components/faculty-componenets/student-table/student-table.component';
import { SubmitPopUpComponent } from 'src/app/components/faculty-componenets/submit-pop-up/submit-pop-up.component';
import { DeletePopUpComponent } from 'src/app/components/faculty-componenets/delete-pop-up/delete-pop-up.component';
import { RefreshComponent } from 'src/app/components/faculty-componenets/refresh/refresh.component';
import { FacultyTooltipSuper, GetRegisteredCount, SuperAdminComponent, } from 'src/app/components/shared/super-admin/super-admin.component';
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
    TotalIntake,
} from 'src/app/components/faculty-componenets/admin/admin.component';
import { CountDown, TimelineComponent, } from 'src/app/components/shared/timeline/timeline.component';
import { environment } from '../environments/environment';
import { AddMapComponent } from 'src/app/components/shared/add-map/add-map.component';
import { HelpComponent } from 'src/app/components/shared/help/help.component';
import { ResetComponent } from 'src/app/components/faculty-componenets/reset/reset.component';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { ShowStudentPreferencesComponent } from 'src/app/components/faculty-componenets/show-student-preferences/show-student-preferences.component';
import { ShowFacultyPreferencesComponent } from 'src/app/components/faculty-componenets/show-faculty-preferences/show-faculty-preferences.component';
import {
    IsPreferenceEdit,
    ShowAvailableProjectsComponent,
} from 'src/app/components/student-components/show-available-projects/show-available-projects.component';
import { EditPreferencesComponent } from 'src/app/components/student-components/edit-preferences/edit-preferences.component';
import { DisplayPreferencesComponent } from 'src/app/components/student-components/display-preferences/display-preferences.component';
import { ShowPreferencesComponent } from 'src/app/components/student-components/show-preferences/show-preferences.component';
import { MatSortModule } from '@angular/material/sort';
import { AdminCheck, FacultyCheck, StudentCheck, SuperAdminCheck, } from 'src/app/components/shared/Pipes/rolePipes';
import { ShowStudentAllotedComponent } from 'src/app/components/faculty-componenets/show-student-alloted/show-student-alloted.component';
import { MatTableModule } from '@angular/material/table';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { CdkDropListActualContainer } from 'src/app/components/student-components/edit-preferences/edit-preferences.directive';
import { InlineEditComponent } from 'src/app/components/shared/inline-edit/inline-edit.component';
import { FacultyHomeComponent } from 'src/app/components/faculty-componenets/faculty-home/faculty-home.component';
import { EditFormComponent } from 'src/app/components/shared/super-admin/edit-form/edit-form.component';

const googleLoginOption = {
    prompt: 'select_account'
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        NavbarComponent,
        RegisterComponent,
        StudentComponent,
        FacultyComponent,
        HomeComponent,
        ProfileComponent,
        StudentProjectsComponent,
        ThemePickerComponent,
        ContentComponent,
        SidenavComponent,
        StudentTableComponent,
        SubmitPopUpComponent,
        DeletePopUpComponent,
        RefreshComponent,
        SuperAdminComponent,
        AdminComponent,
        TimelineComponent,
        AddMapComponent,
        HelpComponent,
        ResetComponent,
        LoaderComponent,
        ShowStudentPreferencesComponent,
        ShowFacultyPreferencesComponent,
        ShowAvailableProjectsComponent,
        EditPreferencesComponent,
        DisplayPreferencesComponent,
        PreferencePipe,
        CountDown,
        ShowPreferencesComponent,
        AllotedStudents,
        FacultyCheck,
        AdminCheck,
        StudentCheck,
        SuperAdminCheck,
        FacultyTooltipSuper,
        UserPhoto,
        CheckRegister,
        GetLinksForNavBar,
        IsPreferenceEdit,
        ShowStudentAllotedComponent,
        CheckLogIn,
        GetIncludedOfTotal,
        GetRegisteredCount,
        StudentIntake,
        ActiveProjects,
        SelectedLength,
        FacultyPublish,
        GetViolations,
        CdkDropListActualContainer,
        InlineEditComponent,
        ProceedPipe,
        TotalIntake,
        FacultyHomeComponent,
        GetDisplayedColumns,
        GetExportDisabled,
        EditFormComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SocialLoginModule,
        BrowserAnimationsModule,
        MaterialModule,
        HttpClientModule,
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
        MatSortModule,
        MatTableModule,
        MatSortModule,
        SatPopoverModule
    ],
    exports: [],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(environment.GOOGLE_CLIENT_ID, googleLoginOption)
                    }
                ]
            } as SocialAuthServiceConfig,
        },
        {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
        UserService,
        ExporttocsvService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
