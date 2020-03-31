import { UserService } from "./../../../services/user/user.service";
import {
  Component,
  OnInit,
  DoCheck,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-super-admin",
  templateUrl: "./super-admin.component.html",
  styleUrls: ["./super-admin.component.scss"]
})
export class SuperAdminComponent implements OnInit {
  constructor(private userService: UserService) {}
  background = "primary";
  faculty;
  student;
  branches = [
    { name: "Computer Science And Engineering", short: "CSE" },
    { name: "Electrical Engineering", short: "EE" },
    { name: "Mechanical Engineering", short: "ME" },
    { name: "Civil Engineering", short: "CE" }
  ];

  ngOnInit() {
    localStorage.setItem("role", "super_admin"); //should be removed
    localStorage.setItem("isLoggedIn", "true"); //should be removed
    this.userService
      .getAllStudents()
      .toPromise()
      .then(result => {
        if (result["message"] == "success") {
          if (result["result"] == "no-students") {
            this.branches["students"] = [];
          } else {
            this.branches["students"] = result["result"];
          }
        }
      });
    this.userService
      .getAllFaculties()
      .toPromise()
      .then(result => {
        if (result["message"] == "success") {
          if (result["result"] == "no-faculties") {
            this.branches["faculties"] = [];
          } else {
            this.branches["faculties"] = result["result"];
          }
        }
      });
  }
}
