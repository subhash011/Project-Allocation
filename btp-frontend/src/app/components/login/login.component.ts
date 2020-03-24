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
    private userService: UserService
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
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {
      this.userService.user = x;
      this.userService.isLoggedIn = true;
      this.router.navigate(["/user"]);
      console.log(this.userService.user);
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.userService.isLoggedIn = false;
    this.router.navigate([""]);
  }
}
