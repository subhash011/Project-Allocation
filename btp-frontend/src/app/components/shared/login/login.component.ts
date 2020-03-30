import { LocalAuthService } from "../../../services/local-auth/local-auth.service";
import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit } from "@angular/core";
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { ActivatedRoute, Router } from "@angular/router";
import { CompileShallowModuleMetadata } from "@angular/compiler";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private localAuth: LocalAuthService
  ) {}

  ngOnInit() {}
  userActivity() {
    if (localStorage.getItem("isLoggedIn") == "true") {
      this.signOut();
    } else {
      this.signInWithGoogle();
    }
  }
  getCondition() {
    if (
      localStorage.getItem("isLoggedIn") == "false" ||
      localStorage.length == 0
    ) {
      return false;
    } else {
      return true;
    }
  }
  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      this.localAuth
        .checkUser(user)
        .toPromise()
        .then(data => {
          const navObj = this.localAuth.validate(data);
          localStorage.setItem("id", data["user_details"]["id"]);
          localStorage.setItem("role", data["position"]);
          const route = navObj.route.split("/");
          if (route[1] == "register") {
            localStorage.setItem("isRegistered", "false");
          }
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
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("role", "none");
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    this.router.navigate([""]);
  }
}
