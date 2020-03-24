import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';


import { SocialLoginModule } from 'angularx-social-login'
import { AuthServiceConfig,GoogleLoginProvider } from 'angularx-social-login'
import { LocalAuthService } from './services/local-auth.service';


const config = new AuthServiceConfig([{
  id: GoogleLoginProvider.PROVIDER_ID,
  provider: new GoogleLoginProvider("101490425049-2t5koea5vs4lf1qu48nfnkn3rjsd304m.apps.googleusercontent.com")
}])

export function provideConfig(){
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    HttpClientModule
  ],
  providers: [
    {
      provide:AuthServiceConfig,
      useFactory:provideConfig
    },
    LocalAuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
