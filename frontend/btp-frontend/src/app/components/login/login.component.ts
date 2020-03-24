import { Component, OnInit } from "@angular/core";
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  user: SocialUser;
  isLoggedIn = false;
  constructor(private authService: AuthService, private router: Router) {}

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
      this.router.navigate(["/user"]);
      console.log(this.user);
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.isLoggedIn = false;
    this.router.navigate([""]);
  }
}
