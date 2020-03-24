import { Component, OnInit } from "@angular/core";
import { AuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";

import { LocalAuthService } from "../../services/local-auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  user: SocialUser;

  constructor(
    private authService: AuthService,
    private localAuth: LocalAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState.subscribe(user => {
      this.user = user;
      console.log(user);
    });
  }

  signInGoogle() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      this.localAuth.checkUser(user).subscribe(data => {
        // console.log(data);
        localStorage.setItem("token", data.user_details.idToken);

        const navObj = this.localAuth.validate(data);
        if (navObj.error === "none") {
          this.router.navigate([navObj.route]);
        } else {
          this.router.navigate([navObj.route, navObj.error]);
        }
      });
    });
  }

  signOut() {
    this.authService.signOut();
  }
}
