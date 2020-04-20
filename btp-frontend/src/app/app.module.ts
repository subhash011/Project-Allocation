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
import { LoginComponent } from "./components/shared/login/login.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { RegisterComponent } from "./components/shared/register/register.component";
import { DragDropComponent } from "./components/student-components/drag-drop/drag-drop.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { StudentComponent } from "./components/student-components/student/student.component";
import { FacultyComponent } from "./components/faculty-componenets/faculty/faculty.component";
import { HomeComponent } from "./components/home/home.component";
import { ShowPreferencesComponent } from "./components/student-components/show-preferences/show-preferences.component";
import { MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ProfileComponent } from "./components/shared/profile/profile.component";
import { StudentProjectsComponent } from "./components/student-components/student-projects/student-projects.component";
import { ContentComponent } from "./components/faculty-componenets/content/content.component";
import { SidenavComponent } from "./components/faculty-componenets/sidenav/sidenav.component";
import { StudentTableComponent } from "./components/faculty-componenets/student-table/student-table.component";
import { SubmitPopUpComponent } from "./components/faculty-componenets/submit-pop-up/submit-pop-up.component";
import { DeletePopUpComponent } from "./components/faculty-componenets/delete-pop-up/delete-pop-up.component";
import { RefreshComponent } from "./components/faculty-componenets/refresh/refresh.component";
import { SuperAdminComponent } from "./components/shared/super-admin/super-admin.component";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { AdminComponent } from "./components/faculty-componenets/admin/admin.component";
import { TimelineComponent } from "./components/shared/timeline/timeline.component";
import { CountdownTimerModule } from "ngx-countdown-timer";
import { environment } from "../environments/environment";
import { AddMapComponent } from "./components/shared/add-map/add-map.component";
import { LoadingBarModule } from "@ngx-loading-bar/core";
import { TypingAnimationModule } from "angular-typing-animation";

const googleLoginOption: LoginOpt = {
  scope: "https://mail.google.com/",
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
    DragDropComponent,
    StudentComponent,
    FacultyComponent,
    HomeComponent,
    ShowPreferencesComponent,
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
  ],
  entryComponents: [
    ShowPreferencesComponent,
    SubmitPopUpComponent,
    DeletePopUpComponent,
    AddMapComponent,
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
    Ng2SearchPipeModule,
    CountdownTimerModule.forRoot(),
    LoadingBarModule,
    TypingAnimationModule,
  ],
  exports: [],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig,
    },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
