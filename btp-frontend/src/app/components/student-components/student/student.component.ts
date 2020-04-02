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
  providers: [LoginComponent]
})
export class StudentComponent implements OnInit {
  constructor(
    private userService: UserService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private mailService: MailService,
    private http: HttpClient
  ) {}
  user: any;
  details: any;
  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user = this.userService
      .getStudentDetails(this.user.id)
      .toPromise()
      .then(data => {
        if (data["status"] == "invalid-token") {
          this.loginObject.signOut();
        } else if (data["status"] == "success") {
          this.details = data["user_details"];
        } else {
          this.snackBar.open("Some unknown Error Occured! Try again", "Ok", {
            duration: 3000
          });
        }
      });
  }

  onSubmit() {
    this.mailService
      .testMethod()
      .toPromise()
      .then(res => {
        if (res["message"] == "success") {
          this.snackBar.open("Successfully Sent Mail", "Ok", {
            duration: 3000
          });
        } else {
          this.snackBar.open(
            "Mail Not Sent! Please Logout and then Login.",
            "Ok",
            {
              duration: 3000
            }
          );
        }
      });
  }
}
