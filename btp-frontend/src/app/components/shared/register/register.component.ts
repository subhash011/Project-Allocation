import { Router } from "@angular/router";
import { UserService } from "./../../../services/user/user.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}
  ngOnInit() {
    this.userForm.get("email").disable();
  }
  user = JSON.parse(localStorage.getItem("user"));
  userForm = this.fb.group({
    firstName: [this.user.firstName, Validators.required],
    lastName: [this.user.lastName, Validators.required],
    CGPA: [null, Validators.required],
    email: [this.user.email, Validators.required],
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

  getRole() {
    if (localStorage.getItem("role") == "student") {
      return true;
    } else {
      return false;
    }
  }

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
    const _user = JSON.parse(localStorage.getItem("user"));

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: _user.idToken
      })
    };

    var position = "";
    if (!isNaN(Number(user["roll_no"].toString()))) {
      position = "student";
    } else {
      position = "faculty";
    }
    var id = _user.id;
    this.message = this.userService.registerUser(
      user,
      httpOptions,
      position,
      id
    );
    if (!this.message) {
      localStorage.setItem("role", position);
      localStorage.removeItem("isRegistered");
    } else {
      console.log("fail");
    }
  }
}