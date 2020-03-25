import { Router } from "@angular/router";
import { UserService } from "./../../services/user/user.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { isNumber } from "util";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent {
  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}
  isStudent = true;
  branch = "";
  userForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    CGPA: [null, Validators.required],
    email: [null, Validators.required],
    branch: [null, Validators.required]
  });
  message = "";
  hasUnitNumber = false;

  branches = [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Electrical Engineering", abbreviation: "EE" },
    { name: "Mechanical Engineering", abbreviation: "ME" },
    { name: "Civil Engineering", abbreviation: "CE" }
  ];

  onSubmit() {
    const user = {
      name:
        this.userForm.get("firstName").value +
        " " +
        this.userForm.get("lastName").value,
      roll_no: String(this.userForm.get("email").value).split("@")[0],
      email: this.userForm.get("email").value,
      gpa: this.userForm.get("CGPA").value,
      stream: this.userForm.get("branch").value
    };
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        authorization: this.userService.user.idToken
      })
    };
    var position = "";
    if (!isNumber(user["roll_no"])) {
      position = "student";
    } else {
      position = "student";
    }
    var id = this.userService.user.id;
    this.httpClient
      .post(
        "http://localhost:8080/" + position + "/register/" + id,
        user,
        httpOptions
      )
      .toPromise()
      .then((data: any) => {
        console.log(data);
        if (data["registration"] == "success") {
          this.message = "success";
          var route = "/" + position + "/" + id;
          this.router.navigate([route]);
        } else {
          this.message = "fail";
        }
      });
  }
}
