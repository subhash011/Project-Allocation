import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  user_info: any;
  role = "";
  constructor(private userService: UserService) {}
  ngOnInit() {
    this.role = localStorage.getItem("role");
    if (this.role == "student") {
      user = this.userService
        .getStudentDetails(localStorage.getItem("id"))
        .subscribe(data => {
          this.user_info = data["user_details"];
        });
    } else if (this.role == "faculty" || this.role == "admin") {
      var user: any;
      this.userService
        .getFacultyDetails(localStorage.getItem("id"))
        .toPromise()
        .then(data => {
          this.user_info = data["user_details"];
        });
    }
  }
  getStudentDiv() {
    if (this.role == "student" && this.user_info != null) {
      return true;
    } else {
      return false;
    }
  }
}