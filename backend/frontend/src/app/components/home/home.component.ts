import { Component, OnInit } from '@angular/core';
import { AuthService } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

import { LocalAuthService } from '../../services/local-auth.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  user: SocialUser;

  constructor(
    private authService : AuthService,
    private localAuth: LocalAuthService
  ) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user)=>{
      this.user = user;
      console.log(user)
    })
  }

  signInGoogle(){
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user)=>{
          
          this.localAuth.checkUser(user)
            .subscribe((data)=>{

              console.log(data);

            })
      
        })
  }

  signOut(){
    this.authService.signOut();
  }

}
