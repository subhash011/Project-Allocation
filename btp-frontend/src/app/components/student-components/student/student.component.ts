import { LoginComponent } from "./../../shared/login/login.component";
import { Router } from "@angular/router";
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
    private router: Router,
    private loginObject: LoginComponent
  ) {}
  user: any;
  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.user = this.userService
      .getStudentDetails(this.user.id)
      .toPromise()
      .then(data => {
        if (data["status"] == "invalid-token") {
          this.loginObject.signOut();
        }
      });
  }
}
