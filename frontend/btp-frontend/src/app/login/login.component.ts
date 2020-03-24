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
  isLoggedIn = false;
  constructor(private authService: AuthService) {}

  ngOnInit() {}
  userActivity() {
    if (this.isLoggedIn) {
      this.signOut();
    } else {
      this.signInWithGoogle();
    }
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {
      this.user = x;
      this.isLoggedIn = true;
      console.log(this.user);
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.isLoggedIn = false;
  }
}
