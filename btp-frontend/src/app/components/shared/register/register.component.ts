import { Router } from "@angular/router";
import { UserService } from "./../../../services/user/user.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router
  ) {}
  ngOnInit() {
    this.userService.role = "none";
    this.userForm.get("email").disable();
  }
  isStudent = true;
  branch = "";
  userForm = this.fb.group({
    firstName: [this.userService.user.firstName, Validators.required],
    lastName: [this.userService.user.lastName, Validators.required],
    CGPA: [null, Validators.required],
    email: [this.userService.user.email, Validators.required],
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
        Authorization: this.userService.user.idToken
      })
    };
    var position = "";
    if (!isNaN(Number(user["roll_no"].toString()))) {
      position = "student";
    } else {
      position = "faculty";
      this.isStudent = false;
    }
    var id = this.userService.user.id;
    this.message = this.userService.registerUser(
      user,
      httpOptions,
      position,
      id
    );
    if (!this.message) {
      this.userService.role = position;
    } else {
      console.log("fail");
    }
  }
}
