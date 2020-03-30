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
    private snackBar: MatSnackBar
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
}
