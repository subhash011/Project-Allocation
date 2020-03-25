import { LocalAuthService } from "../../services/local-auth/local-auth.service";
import { UserService } from "./../../services/user/user.service";
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
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private localAuth: LocalAuthService
  ) {}

  ngOnInit() {}
  userActivity() {
    if (this.userService.isLoggedIn) {
      this.signOut();
    } else {
      this.signInWithGoogle();
    }
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      this.userService.user = user;
      this.userService.isLoggedIn = true;
      this.localAuth
        .checkUser(user)
        .toPromise()
        .then(data => {
          this.userService.token = data.user_details.idToken;
          const navObj = this.localAuth.validate(data);
          this.userService.role = data["position"];
          if (navObj.error === "none") {
            this.router.navigate([navObj.route]);
          } else {
            this.router.navigate([navObj.route, navObj.error]);
          }
        });
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.userService.isLoggedIn = false;
    this.router.navigate([""]);
  }
}
