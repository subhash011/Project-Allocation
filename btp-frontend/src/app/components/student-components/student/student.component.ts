import { LoadingBarService } from "@ngx-loading-bar/core";
import { HttpClient } from "@angular/common/http";
import { MailService } from "./../../../services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../../shared/login/login.component";
import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user/user.service";

@Component({
  selector: "app-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [LoginComponent],
})
export class StudentComponent implements OnInit {
  constructor(
    private userService: UserService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private mailService: MailService,
    private http: HttpClient,
    private loadingService: LoadingBarService
  ) {}
  user: any;
  details: any;
  loaded: boolean = false;
  ngOnInit() {
    this.loadingService.start();
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user = this.userService
      .getStudentDetails(this.user.id)
      .toPromise()
      .then((data) => {
        if (data["status"] == "invalid-token") {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
          this.loadingService.stop();
        } else if (data["status"] == "success") {
          this.details = data["user_details"];
          this.loaded = true;
          this.loadingService.stop();
        } else {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
          this.loadingService.stop();
        }
      });
  }
}
