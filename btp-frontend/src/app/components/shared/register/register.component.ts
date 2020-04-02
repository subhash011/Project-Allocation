import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "./../../../services/user/user.service";
import { HttpHeaders } from "@angular/common/http";
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
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  ngOnInit() {
    this.userForm.get("email").disable();
    if (localStorage.getItem("role") == "super_admin") {
      this.userForm.get("branch").clearValidators();
    }
    if (localStorage.getItem("role") == "student") {
      this.userForm.get("CGPA").setValidators(Validators.required);
    } else {
      this.userForm.get("CGPA").clearValidators();
    }
  }
  user = JSON.parse(localStorage.getItem("user"));
  userForm = this.fb.group({
    firstName: [this.user.firstName, Validators.required],
    lastName: [this.user.lastName, Validators.required],
    CGPA: [null],
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

  isSuperAdmin() {
    if (localStorage.getItem("role") == "super_admin") {
      return true;
    } else {
      return false;
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
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
      position = localStorage.getItem("role");
      var id = _user.id;
      this.userService
        .registerUser(user, httpOptions, position, id)
        .toPromise()
        .then((data: any) => {
          if (data["registration"] == "success") {
            localStorage.setItem("role", position);
            localStorage.removeItem("isRegistered");
            var snackBarRef = this.snackBar.open(
              "Registration Successful",
              "Ok",
              {
                duration: 3000
              }
            );
            var route = "/" + position + "/" + id;
            this.router.navigate([route]);
          } else {
            var snackBarRef = this.snackBar.open(
              "Registration Failed! Please Try Again",
              "Ok",
              {
                duration: 3000
              }
            );
          }
        })
        .catch(() => {
          var snackBarRef = this.snackBar.open(
            "Registration Failed! Please Try Again",
            "Ok",
            {
              duration: 3000
            }
          );
        });
    }
  }
}
