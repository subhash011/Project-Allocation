import { MaterialModule } from "./material/material.module";
import { HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";

import { SocialLoginModule } from "angularx-social-login";
import { AuthServiceConfig, GoogleLoginProvider } from "angularx-social-login";
import { LocalAuthService } from "./services/local-auth.service";
import { RegisterComponent } from "./components/register/register.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { StudentComponent } from "./components/student/student.component";
import { FacultyComponent } from "./components/faculty/faculty.component";

import { UserDetailsService } from "./services/user-details.service";

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(
      "101490425049-2t5koea5vs4lf1qu48nfnkn3rjsd304m.apps.googleusercontent.com"
    )
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    StudentComponent,
    FacultyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    LocalAuthService,
    UserDetailsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
