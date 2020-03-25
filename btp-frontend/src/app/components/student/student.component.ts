import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user/user.service";

@Component({
  selector: "app-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.css"]
})
export class StudentComponent implements OnInit {
  constructor(private userService: UserService) {}
  user = "";
  ngOnInit() {
    this.userService
      .getStudentDetails(this.userService.user.id)
      .toPromise()
      .then(data => {
        console.log(data);
      });
  }
}
