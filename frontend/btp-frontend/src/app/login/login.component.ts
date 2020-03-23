import { Component, OnInit } from "@angular/core";
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  user: SocialUser;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {
      this.user = x;
      console.log(this.user);
    });
  }

  signOut(): void {
    this.authService.signOut();
  }
}
