import { ExporttocsvService } from "./services/exporttocsv/exporttocsv.service";
import { UserService } from "./services/user/user.service";
import { ThemePickerComponent } from "./components/shared/theme-picker/theme-picker.component";
import { MaterialModule } from "./material/material.module";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SocialLoginModule, LoginOpt } from "angularx-social-login";
import { AuthServiceConfig, GoogleLoginProvider } from "angularx-social-login";
import { LoginComponent, CheckLogIn } from "./components/shared/login/login.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NavbarComponent,
  CheckRegister,
  GetLinksForNavBar,
} from "./components/shared/navbar/navbar.component";
import { RegisterComponent } from "./components/shared/register/register.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { StudentComponent } from "./components/student-components/student/student.component";
import { FacultyComponent } from "./components/faculty-componenets/faculty/faculty.component";
import { HomeComponent } from "./components/home/home.component";
import { MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  ProfileComponent,
  UserPhoto,
} from "./components/shared/profile/profile.component";
import { StudentProjectsComponent } from "./components/student-components/student-projects/student-projects.component";
import { ContentComponent, FacultyPublish } from "./components/faculty-componenets/content/content.component";
import { SidenavComponent } from "./components/faculty-componenets/sidenav/sidenav.component";
import { StudentTableComponent, GetDisplayedColumns } from "./components/faculty-componenets/student-table/student-table.component";
import { SubmitPopUpComponent } from "./components/faculty-componenets/submit-pop-up/submit-pop-up.component";
import { DeletePopUpComponent } from "./components/faculty-componenets/delete-pop-up/delete-pop-up.component";
import { RefreshComponent } from "./components/faculty-componenets/refresh/refresh.component";
import {
  SuperAdminComponent,
  FacultyTooltipSuper,
  GetRegisteredCount,
} from "./components/shared/super-admin/super-admin.component";
import {
  AdminComponent,
  AllotedStudents,
  GetIncludedOfTotal,
  StudentIntake,
  ActiveProjects,
  SelectedLength,
  GetViolations,
  ProceedPipe,
  TotalIntake,
  GetExportDisabled,
} from "./components/faculty-componenets/admin/admin.component";
import {
  TimelineComponent,
  CountDown,
} from "./components/shared/timeline/timeline.component";
import { environment } from "../environments/environment";
import { AddMapComponent } from "./components/shared/add-map/add-map.component";
import { LoadingBarModule } from "@ngx-loading-bar/core";
import { TypingAnimationModule } from "angular-typing-animation";
import { HelpComponent } from "./components/shared/help/help.component";
import { ResetComponent } from "./components/faculty-componenets/reset/reset.component";
import { LoaderComponent } from "./components/shared/loader/loader.component";
import { ShowStudentPreferencesComponent } from "./components/faculty-componenets/show-student-preferences/show-student-preferences.component";
import { ClipboardModule } from "ngx-clipboard";
import { ShowFacultyPreferencesComponent } from "./components/faculty-componenets/show-faculty-preferences/show-faculty-preferences.component";
import {
  ShowAvailableProjectsComponent,
  IsPreferenceEdit,
} from "./components/student-components/show-available-projects/show-available-projects.component";
import { EditPreferencesComponent } from "./components/student-components/edit-preferences/edit-preferences.component";
import { DisplayPreferencesComponent } from "./components/student-components/display-preferences/display-preferences.component";
import { PreferencePipe } from "./components/faculty-componenets/student-table/student-table.component";
import { ShowPreferencesComponent } from "./components/student-components/show-preferences/show-preferences.component";
import { MatSortModule } from "@angular/material/sort";
import {
  FacultyCheck,
  AdminCheck,
  StudentCheck,
  SuperAdminCheck,
} from "./components/shared/Pipes/rolePipes";
import { ShowStudentAllotedComponent } from "./components/faculty-componenets/show-student-alloted/show-student-alloted.component";
import { MatTableModule } from '@angular/material';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { CdkDropListActualContainer } from './components/student-components/edit-preferences/edit-preferences.directive';
import { InlineEditComponent } from './components/shared/inline-edit/inline-edit.component';
import { FacultyHomeComponent } from './components/faculty-componenets/faculty-home/faculty-home.component';
import { EmailPreviewComponent } from './components/faculty-componenets/email-preview/email-preview.component';
const googleLoginOption: LoginOpt = {
  prompt: "select_account",
};
const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(
      environment.GOOGLE_CLIENT_ID,
      googleLoginOption
    ),
  },
]);
export function provideConfig() {
  return config;
}
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
    EmailPreviewComponent
  ],
  entryComponents: [
    SubmitPopUpComponent,
    DeletePopUpComponent,
    AddMapComponent,
    ResetComponent,
    LoaderComponent,
    ShowStudentPreferencesComponent,
    ShowFacultyPreferencesComponent,
    ShowStudentAllotedComponent,
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
    LoadingBarModule,
    TypingAnimationModule,
    ClipboardModule,
    MatSortModule,
    MatTableModule,
    MatSortModule,
    SatPopoverModule
  ],
  exports: [ClipboardModule],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig,
    },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    UserService,
    ExporttocsvService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
