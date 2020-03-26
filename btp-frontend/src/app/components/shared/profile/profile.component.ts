import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  constructor(private userService: UserService) {}
  ngOnInit() {
    var user: any;
    const role = localStorage.getItem("role");
    if (role == "student") {
      user = this.userService
        .getStudentDetails(localStorage.getItem("id"))
        .subscribe(data => {
          user = data;
        });
      console.log(user);
    } else if (role == "faculty" || role == "admin") {
      var user: any;
      this.userService
        .getFacultyDetails(localStorage.getItem("id"))
        .toPromise()
        .then(data => {
          console.log(data);
          user = data["user_details"];
        });
    }
  }
}
